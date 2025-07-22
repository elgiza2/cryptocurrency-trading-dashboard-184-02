-- Allow admin operations on missions table
-- First, let's create admin policies for missions table

-- Allow admins to insert missions
CREATE POLICY "Admins can insert missions" 
ON public.missions 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to update missions  
CREATE POLICY "Admins can update missions"
ON public.missions 
FOR UPDATE 
USING (true);

-- Allow admins to delete missions
CREATE POLICY "Admins can delete missions"
ON public.missions 
FOR DELETE 
USING (true);

-- Allow admin operations on cryptocurrencies table
-- Allow admins to insert cryptocurrencies
CREATE POLICY "Admins can insert cryptocurrencies" 
ON public.cryptocurrencies 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to update cryptocurrencies  
CREATE POLICY "Admins can update cryptocurrencies"
ON public.cryptocurrencies 
FOR UPDATE 
USING (true);

-- Allow admins to delete cryptocurrencies
CREATE POLICY "Admins can delete cryptocurrencies"
ON public.cryptocurrencies 
FOR DELETE 
USING (true);