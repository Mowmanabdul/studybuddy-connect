
CREATE TABLE public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  grade text NOT NULL,
  difficulty text NOT NULL DEFAULT 'mixed',
  score integer DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'in_progress',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz sessions"
  ON public.quiz_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions"
  ON public.quiz_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions"
  ON public.quiz_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_index integer NOT NULL,
  selected_option text NOT NULL,
  correct_option text NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz answers"
  ON public.quiz_answers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE quiz_sessions.id = quiz_answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own quiz answers"
  ON public.quiz_answers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE quiz_sessions.id = quiz_answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  ));
