-- Update the daily login mission to English
UPDATE public.missions 
SET title = 'Daily Login Check',
    description = 'Log in daily to earn rewards'
WHERE title = 'التحقق من تسجيل الدخول اليومي';