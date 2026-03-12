import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MessageSquare,
  FolderPlus,
  MoreHorizontal,
  Trash2,
  Pencil,
  FolderOpen,
  FolderClosed,
  ChevronDown,
  ChevronRight,
  MoveRight,
} from "lucide-react";
import type { Conversation, ChatFolder } from "@/hooks/useHomeworkChat";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
  conversations: Conversation[];
  folders: ChatFolder[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveToFolder: (convId: string, folderId: string | null) => void;
}

export const ChatSidebar = ({
  conversations,
  folders,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onCreateFolder,
  onDeleteFolder,
  onMoveToFolder,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unfolderedConvs = filtered.filter(c => !c.folder_id);
  const getConvsInFolder = (folderId: string) =>
    filtered.filter(c => c.folder_id === folderId);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  const getSubjectIcon = (subject: string) => {
    return subject === "Mathematics" ? "📐" : "🔬";
  };

  const ConversationItem = ({ conv }: { conv: Conversation }) => (
    <div
      className={cn(
        "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm",
        activeConversationId === conv.id
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      onClick={() => onSelectConversation(conv.id)}
    >
      <span className="text-xs shrink-0">{getSubjectIcon(conv.subject)}</span>
      {editingId === conv.id ? (
        <Input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={() => handleRename(conv.id)}
          onKeyDown={e => e.key === "Enter" && handleRename(conv.id)}
          className="h-6 text-xs py-0 px-1"
          autoFocus
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="truncate flex-1 text-[13px]">{conv.title}</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => { setEditingId(conv.id); setEditTitle(conv.title); }}>
            <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
          </DropdownMenuItem>
          {folders.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MoveRight className="w-3.5 h-3.5 mr-2" /> Move to folder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onMoveToFolder(conv.id, null)}>
                  No folder
                </DropdownMenuItem>
                {folders.map(f => (
                  <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(conv.id, f.id)}>
                    {f.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDeleteConversation(conv.id)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-card border-r">
      {/* Header */}
      <div className="p-3 space-y-2">
        <Button onClick={onNewChat} className="w-full justify-start gap-2" size="sm">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {/* Folders */}
          {folders.map(folder => {
            const folderConvs = getConvsInFolder(folder.id);
            const isExpanded = expandedFolders.has(folder.id);
            return (
              <div key={folder.id}>
                <div
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted text-sm font-medium text-muted-foreground"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                      <FolderOpen className="w-3.5 h-3.5 shrink-0 text-primary" />
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      <FolderClosed className="w-3.5 h-3.5 shrink-0" />
                    </>
                  )}
                  <span className="truncate flex-1 text-[13px]">{folder.name}</span>
                  <span className="text-[11px] text-muted-foreground/60">{folderConvs.length}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={e => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {isExpanded && (
                  <div className="ml-4 space-y-0.5">
                    {folderConvs.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground/50 px-3 py-1">No chats</p>
                    ) : (
                      folderConvs.map(c => <ConversationItem key={c.id} conv={c} />)
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unfoldered conversations */}
          {unfolderedConvs.length > 0 && folders.length > 0 && (
            <p className="text-[11px] text-muted-foreground/50 px-3 pt-3 pb-1 uppercase tracking-wider font-medium">
              Recent
            </p>
          )}
          {unfolderedConvs.map(c => (
            <ConversationItem key={c.id} conv={c} />
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No conversations yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer: New folder */}
      <div className="p-3 border-t">
        {showNewFolder ? (
          <div className="flex gap-1">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreateFolder()}
              className="h-8 text-xs"
              autoFocus
            />
            <Button size="sm" className="h-8 px-2" onClick={handleCreateFolder}>
              Add
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground text-xs"
            onClick={() => setShowNewFolder(true)}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            New Folder
          </Button>
        )}
      </div>
    </div>
  );
};
