
-- Add DELETE policy for eventos
CREATE POLICY "Authenticated can delete eventos" ON public.eventos FOR DELETE TO authenticated USING (true);

-- Add DELETE policy for finanzas
CREATE POLICY "Authenticated can delete finanzas" ON public.finanzas FOR DELETE TO authenticated USING (true);
