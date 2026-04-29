-- Run this in your Neon SQL editor to add the new categories

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

ALTER TABLE expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN (
    'comida','transporte','entretenimiento','suscripciones',
    'combustible','salud','ropa','regalos','hogar','viajes','otros'
  ));
