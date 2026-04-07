# Frame Photo Printer - API Documentation

## Overview

API endpoints para gerenciar captura, moldura e impressão de fotos.

## Endpoints

### POST /api/capture
Captura e armazena foto da câmera.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "orientation": "portrait" | "landscape"
}
```

**Response:**
```json
{
  "photoId": "uuid"
}
```

**Status Codes:**
- `201 Created` - Foto capturada com sucesso
- `400 Bad Request` - Dados ausentes
- `500 Internal Server Error` - Erro no servidor

---

### POST /api/frame
Aplica moldura 15x21 à foto capturada.

**Request:**
```json
{
  "photoId": "uuid",
  "orientation": "portrait" | "landscape"
}
```

**Response:**
```json
{
  "success": true,
  "photoId": "uuid"
}
```

**Status Codes:**
- `200 OK` - Moldura aplicada
- `400 Bad Request` - Parâmetros ausentes
- `404 Not Found` - Foto não encontrada
- `500 Internal Server Error` - Erro no processamento

---

### GET /api/printers
Lista todas as impressoras conectadas.

**Response:**
```json
[
  {
    "name": "Brother_HL_L8360CDW",
    "status": "idle",
    "isDefault": true
  },
  {
    "name": "Canon_imagePROGRAF",
    "status": "idle",
    "isDefault": false
  }
]
```

**Status Codes:**
- `200 OK` - Lista de impressoras
- `500 Internal Server Error` - Erro ao listar

---

### POST /api/print
Envia foto com moldura para impressora.

**Request:**
```json
{
  "photoId": "uuid",
  "printerName": "string"
}
```

**Response:**
```json
{
  "success": true,
  "logId": "uuid"
}
```

**Status Codes:**
- `200 OK` - Enviado para impressão
- `400 Bad Request` - Parâmetros ausentes
- `404 Not Found` - Foto não encontrada
- `500 Internal Server Error` - Erro na impressão

---

## Error Responses

Todas as respostas de erro seguem este formato:

```json
{
  "error": "Descrição do erro",
  "details": "Detalhes técnicos (opcional)"
}
```

## Rate Limiting

- Sem rate limiting implementado (configure conforme necessário)
- Máximo upload: 10MB (configurável em .env)

## Autenticação

- Sem autenticação (adicione conforme necessário)
- Implementar JWT ou API keys para produção
