-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create diagnostic_tests table (test templates)
CREATE TABLE public.diagnostic_tests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    total_questions INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diagnostic_questions table
CREATE TABLE public.diagnostic_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    options JSONB NOT NULL, -- Array of {id, text, isCorrect}
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diagnostic_attempts table (user test sessions)
CREATE TABLE public.diagnostic_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    test_id UUID NOT NULL REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    total_questions INTEGER,
    time_spent_seconds INTEGER,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Create diagnostic_answers table (individual answers)
CREATE TABLE public.diagnostic_answers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES public.diagnostic_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.diagnostic_questions(id) ON DELETE CASCADE,
    selected_option_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diagnostic_recommendations table (AI-generated recommendations)
CREATE TABLE public.diagnostic_recommendations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES public.diagnostic_attempts(id) ON DELETE CASCADE,
    overall_analysis TEXT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]', -- Array of topics
    weaknesses JSONB NOT NULL DEFAULT '[]', -- Array of topics
    recommendations JSONB NOT NULL DEFAULT '[]', -- Array of {topic, suggestion, priority}
    study_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diagnostic_tests (public read, admin write)
CREATE POLICY "Anyone can view diagnostic tests"
ON public.diagnostic_tests FOR SELECT
USING (true);

CREATE POLICY "Admins can manage diagnostic tests"
ON public.diagnostic_tests FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diagnostic_questions (public read for test takers)
CREATE POLICY "Anyone can view diagnostic questions"
ON public.diagnostic_questions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage diagnostic questions"
ON public.diagnostic_questions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diagnostic_attempts
CREATE POLICY "Users can view their own attempts"
ON public.diagnostic_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
ON public.diagnostic_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
ON public.diagnostic_attempts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Tutors can view learner attempts"
ON public.diagnostic_attempts FOR SELECT
USING (public.has_role(auth.uid(), 'tutor'));

CREATE POLICY "Admins can manage all attempts"
ON public.diagnostic_attempts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diagnostic_answers
CREATE POLICY "Users can view their own answers"
ON public.diagnostic_answers FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.diagnostic_attempts 
    WHERE id = attempt_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create answers for their attempts"
ON public.diagnostic_answers FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.diagnostic_attempts 
    WHERE id = attempt_id AND user_id = auth.uid()
));

CREATE POLICY "Tutors can view learner answers"
ON public.diagnostic_answers FOR SELECT
USING (public.has_role(auth.uid(), 'tutor'));

CREATE POLICY "Admins can manage all answers"
ON public.diagnostic_answers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diagnostic_recommendations
CREATE POLICY "Users can view their own recommendations"
ON public.diagnostic_recommendations FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.diagnostic_attempts 
    WHERE id = attempt_id AND user_id = auth.uid()
));

CREATE POLICY "Service role can insert recommendations"
ON public.diagnostic_recommendations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Tutors can view learner recommendations"
ON public.diagnostic_recommendations FOR SELECT
USING (public.has_role(auth.uid(), 'tutor'));

CREATE POLICY "Admins can manage all recommendations"
ON public.diagnostic_recommendations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_diagnostic_questions_test_id ON public.diagnostic_questions(test_id);
CREATE INDEX idx_diagnostic_attempts_user_id ON public.diagnostic_attempts(user_id);
CREATE INDEX idx_diagnostic_attempts_test_id ON public.diagnostic_attempts(test_id);
CREATE INDEX idx_diagnostic_answers_attempt_id ON public.diagnostic_answers(attempt_id);
CREATE INDEX idx_diagnostic_recommendations_attempt_id ON public.diagnostic_recommendations(attempt_id);

-- Add trigger for updated_at on diagnostic_tests
CREATE TRIGGER update_diagnostic_tests_updated_at
BEFORE UPDATE ON public.diagnostic_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some sample diagnostic tests
INSERT INTO public.diagnostic_tests (title, description, subject, grade, duration_minutes, total_questions) VALUES
('Grade 10 Mathematics Assessment', 'Comprehensive assessment covering algebra, geometry, and trigonometry', 'Mathematics', '10', 45, 15),
('Grade 11 Mathematics Assessment', 'Assessment covering functions, calculus basics, and probability', 'Mathematics', '11', 45, 15),
('Grade 10 Physical Sciences Assessment', 'Assessment covering mechanics, electricity, and waves', 'Physical Sciences', '10', 40, 12),
('Grade 11 Physical Sciences Assessment', 'Assessment covering chemical reactions, stoichiometry, and electromagnetism', 'Physical Sciences', '11', 40, 12);

-- Seed sample questions for Grade 10 Mathematics
INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'Solve for x: 2x + 5 = 15',
    'Algebra',
    'easy'::difficulty_level,
    '[{"id": "a", "text": "x = 5", "isCorrect": true}, {"id": "b", "text": "x = 10", "isCorrect": false}, {"id": "c", "text": "x = 7.5", "isCorrect": false}, {"id": "d", "text": "x = 20", "isCorrect": false}]'::jsonb,
    'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5',
    1
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'Simplify: 3(x + 4) - 2(x - 1)',
    'Algebra',
    'medium'::difficulty_level,
    '[{"id": "a", "text": "x + 14", "isCorrect": true}, {"id": "b", "text": "x + 10", "isCorrect": false}, {"id": "c", "text": "5x + 14", "isCorrect": false}, {"id": "d", "text": "x + 12", "isCorrect": false}]'::jsonb,
    '3x + 12 - 2x + 2 = x + 14',
    2
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'What is the gradient of the line y = 3x - 7?',
    'Coordinate Geometry',
    'easy'::difficulty_level,
    '[{"id": "a", "text": "3", "isCorrect": true}, {"id": "b", "text": "-7", "isCorrect": false}, {"id": "c", "text": "-3", "isCorrect": false}, {"id": "d", "text": "7", "isCorrect": false}]'::jsonb,
    'In the equation y = mx + c, m represents the gradient. Here m = 3.',
    3
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'Find the area of a triangle with base 8cm and height 6cm.',
    'Geometry',
    'easy'::difficulty_level,
    '[{"id": "a", "text": "24 cm²", "isCorrect": true}, {"id": "b", "text": "48 cm²", "isCorrect": false}, {"id": "c", "text": "14 cm²", "isCorrect": false}, {"id": "d", "text": "28 cm²", "isCorrect": false}]'::jsonb,
    'Area = ½ × base × height = ½ × 8 × 6 = 24 cm²',
    4
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'Solve the quadratic equation: x² - 5x + 6 = 0',
    'Algebra',
    'medium'::difficulty_level,
    '[{"id": "a", "text": "x = 2 or x = 3", "isCorrect": true}, {"id": "b", "text": "x = -2 or x = -3", "isCorrect": false}, {"id": "c", "text": "x = 1 or x = 6", "isCorrect": false}, {"id": "d", "text": "x = 5 or x = 1", "isCorrect": false}]'::jsonb,
    'Factorize: (x - 2)(x - 3) = 0, so x = 2 or x = 3',
    5
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'If sin θ = 0.5, what is θ (in degrees)?',
    'Trigonometry',
    'medium'::difficulty_level,
    '[{"id": "a", "text": "30°", "isCorrect": true}, {"id": "b", "text": "45°", "isCorrect": false}, {"id": "c", "text": "60°", "isCorrect": false}, {"id": "d", "text": "90°", "isCorrect": false}]'::jsonb,
    'sin 30° = 0.5 is a standard angle value.',
    6
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'Calculate: (-3)² × 2 - 4',
    'Number Operations',
    'easy'::difficulty_level,
    '[{"id": "a", "text": "14", "isCorrect": true}, {"id": "b", "text": "-22", "isCorrect": false}, {"id": "c", "text": "22", "isCorrect": false}, {"id": "d", "text": "-14", "isCorrect": false}]'::jsonb,
    '(-3)² = 9, then 9 × 2 = 18, finally 18 - 4 = 14',
    7
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'Find the distance between points A(1, 2) and B(4, 6).',
    'Coordinate Geometry',
    'medium'::difficulty_level,
    '[{"id": "a", "text": "5", "isCorrect": true}, {"id": "b", "text": "7", "isCorrect": false}, {"id": "c", "text": "25", "isCorrect": false}, {"id": "d", "text": "√7", "isCorrect": false}]'::jsonb,
    'Distance = √[(4-1)² + (6-2)²] = √[9 + 16] = √25 = 5',
    8
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'What is the value of x if 2^x = 32?',
    'Exponents',
    'medium'::difficulty_level,
    '[{"id": "a", "text": "5", "isCorrect": true}, {"id": "b", "text": "4", "isCorrect": false}, {"id": "c", "text": "6", "isCorrect": false}, {"id": "d", "text": "16", "isCorrect": false}]'::jsonb,
    '32 = 2^5, so x = 5',
    9
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';

INSERT INTO public.diagnostic_questions (test_id, question_text, topic, difficulty, options, explanation, order_index)
SELECT 
    dt.id,
    'The sum of angles in a quadrilateral is:',
    'Geometry',
    'easy'::difficulty_level,
    '[{"id": "a", "text": "360°", "isCorrect": true}, {"id": "b", "text": "180°", "isCorrect": false}, {"id": "c", "text": "270°", "isCorrect": false}, {"id": "d", "text": "540°", "isCorrect": false}]'::jsonb,
    'The sum of interior angles of any quadrilateral is always 360°.',
    10
FROM public.diagnostic_tests dt WHERE dt.title = 'Grade 10 Mathematics Assessment';