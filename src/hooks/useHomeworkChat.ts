import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  mode: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatFolder = {
  id: string;
  name: string;
  created_at: string;
};

type Subject = "Mathematics" | "Physical Sciences";
type Mode = "guidance" | "exam";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/homework-helper`;

export const useHomeworkChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState<Subject>("Mathematics");
  const [grade, setGrade] = useState<string>("10");
  const [mode, setMode] = useState<Mode>("guidance");
  
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Load conversations and folders
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const [convRes, folderRes] = await Promise.all([
        supabase
          .from("chat_conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("chat_folders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);
      if (convRes.data) setConversations(convRes.data as Conversation[]);
      if (folderRes.data) setFolders(folderRes.data as ChatFolder[]);
    } catch (e) {
      console.error("Failed to load conversations:", e);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for a conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSubject(conv.subject as Subject);
      setGrade(conv.grade);
      setMode(conv.mode as Mode);
    }

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
    setActiveConversationId(conversationId);
  }, [conversations]);

  // Create new conversation
  const createConversation = useCallback(async (firstMessage?: string) => {
    if (!user) return null;
    const title = firstMessage 
      ? firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "")
      : "New Chat";
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title,
        subject,
        grade,
        mode,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
    
    const newConv = data as Conversation;
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, [user, subject, grade, mode]);

  // Start a new chat (reset state)
  const newChat = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  // Save messages to database
  const saveMessages = useCallback(async (convId: string, newMessages: { role: string; content: string }[]) => {
    const inserts = newMessages.map(m => ({
      conversation_id: convId,
      role: m.role,
      content: m.content,
    }));
    await supabase.from("chat_messages").insert(inserts);
    
    // Update conversation timestamp and title if first message
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (newMessages[0]?.role === "user" && messages.length === 0) {
      const title = newMessages[0].content.slice(0, 50) + (newMessages[0].content.length > 50 ? "..." : "");
      updates.title = title;
    }
    await supabase.from("chat_conversations").update(updates).eq("id", convId);
    
    // Refresh conversations list
    loadConversations();
  }, [messages.length, loadConversations]);

  // Delete conversation
  const deleteConversation = useCallback(async (convId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversationId === convId) {
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  // Rename conversation
  const renameConversation = useCallback(async (convId: string, newTitle: string) => {
    await supabase.from("chat_conversations").update({ title: newTitle }).eq("id", convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: newTitle } : c));
  }, []);

  // Folder management
  const createFolder = useCallback(async (name: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_folders")
      .insert({ user_id: user.id, name })
      .select()
      .single();
    if (data) setFolders(prev => [...prev, data as ChatFolder]);
  }, [user]);

  const deleteFolder = useCallback(async (folderId: string) => {
    // Unset folder_id on conversations in this folder
    await supabase.from("chat_conversations").update({ folder_id: null }).eq("folder_id", folderId);
    await supabase.from("chat_folders").delete().eq("id", folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setConversations(prev => prev.map(c => c.folder_id === folderId ? { ...c, folder_id: null } : c));
  }, []);

  const moveToFolder = useCallback(async (convId: string, folderId: string | null) => {
    await supabase.from("chat_conversations").update({ folder_id: folderId }).eq("id", convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, folder_id: folderId } : c));
  }, []);

  // Send message
  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Create conversation if needed
    let convId = activeConversationId;
    if (!convId) {
      convId = await createConversation(input.trim());
      if (!convId) {
        setIsLoading(false);
        return;
      }
    }

    let assistantSoFar = "";
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const allMessages = [...messages, userMsg];

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, subject, grade, mode }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // Save both messages to DB
      await saveMessages(convId, [
        userMsg,
        { role: "assistant", content: assistantSoFar },
      ]);
    } catch (e) {
      console.error("Chat error:", e);
      toast.error(e instanceof Error ? e.message : "Failed to send message");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, subject, grade, mode, isLoading, activeConversationId, createConversation, saveMessages]);

  return {
    messages,
    isLoading,
    subject,
    grade,
    mode,
    setSubject,
    setGrade,
    setMode,
    sendMessage,
    newChat,
    // Conversation management
    conversations,
    folders,
    activeConversationId,
    loadingConversations,
    loadConversation,
    deleteConversation,
    renameConversation,
    createFolder,
    deleteFolder,
    moveToFolder,
  };
};
