-- Create session status enum
CREATE TYPE public.session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create tutor availability table (recurring weekly slots)
CREATE TABLE public.tutor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create session bookings table
CREATE TABLE public.session_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  learner_id UUID NOT NULL,
  subject TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status session_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;

-- Tutor availability policies
CREATE POLICY "Tutors can manage their own availability"
ON public.tutor_availability
FOR ALL
USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Anyone can view active tutor availability"
ON public.tutor_availability
FOR SELECT
USING (is_active = true);

-- Session bookings policies
CREATE POLICY "Tutors can view their sessions"
ON public.session_bookings
FOR SELECT
USING (auth.uid() = tutor_id);

CREATE POLICY "Learners can view their sessions"
ON public.session_bookings
FOR SELECT
USING (auth.uid() = learner_id);

CREATE POLICY "Learners can create bookings"
ON public.session_bookings
FOR INSERT
WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Tutors can update their sessions"
ON public.session_bookings
FOR UPDATE
USING (auth.uid() = tutor_id);

CREATE POLICY "Learners can cancel their sessions"
ON public.session_bookings
FOR UPDATE
USING (auth.uid() = learner_id AND status = 'pending');

CREATE POLICY "Admins can manage all sessions"
ON public.session_bookings
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_tutor_availability_tutor ON public.tutor_availability(tutor_id);
CREATE INDEX idx_tutor_availability_day ON public.tutor_availability(day_of_week);
CREATE INDEX idx_session_bookings_tutor ON public.session_bookings(tutor_id);
CREATE INDEX idx_session_bookings_learner ON public.session_bookings(learner_id);
CREATE INDEX idx_session_bookings_scheduled ON public.session_bookings(scheduled_at);

-- Add triggers for updated_at
CREATE TRIGGER update_tutor_availability_updated_at
BEFORE UPDATE ON public.tutor_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_bookings_updated_at
BEFORE UPDATE ON public.session_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();