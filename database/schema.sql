CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_data BYTEA NOT NULL,
    orientation VARCHAR(20) NOT NULL CHECK (orientation IN ('portrait', 'landscape')),
    frame_applied BOOLEAN DEFAULT false,
    framed_image_data BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    printed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE printer_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    driver VARCHAR(100),
    status VARCHAR(20) DEFAULT 'idle',
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE print_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    printer_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'success', 'failed')),
    error_message TEXT,
    printed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE frame_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    width_mm DECIMAL(10, 2),
    height_mm DECIMAL(10, 2),
    border_px INT DEFAULT 40,
    color VARCHAR(7) DEFAULT '#FFFFFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_photos_created_at ON photos(created_at);
CREATE INDEX idx_photos_printed_at ON photos(printed_at);
CREATE INDEX idx_print_logs_photo_id ON print_logs(photo_id);
CREATE INDEX idx_print_logs_status ON print_logs(status);

-- Frame padrão (15x21)
INSERT INTO frame_templates (name, width_mm, height_mm, border_px, color)
VALUES ('15x21 Portrait', 150, 210, 40, '#FFFFFF'),
       ('15x21 Landscape', 210, 150, 40, '#FFFFFF');
