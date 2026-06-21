## Connection Protocol

### Basic Flow

1. **Connect** to scheduler via TCP socket
2. **Send** JSON request terminated with `\n`
3. **Receive** JSON response terminated with `\n`
4. **Close** connection (or keep alive for combined mode)

## API Endpoints (Request Types)

### 1. Single Model Inference

Use this for calling a single ML model.

**Request Format:**
```json
{
  "model": "dxassist-angiography",
  "data": {
    "image": "base64_encoded_image_string",
  }
}
```

**Response Format:**
```json
{
  "coronary_disease_probability": 98
}
```

**Available Single Models:**
- `dxassist-angiography` - Angiography image analysis
- `dxassist-screening` - Blood test screening analysis

---

### 2. Combined Model Inference

Use this for multi-model inference with weighted aggregation. The scheduler will process models sequentially and request additional data as needed.

**Initial Request Format:**
```json
{
  "model": "dxassist-heartdisease",
  "data": {
    "image": "base64_encoded_angiography_image",
  }
}
```

**Important:** For combined models, you must **keep the socket connection open** to handle intermediate data requests.

#### Combined Mode Flow

1. **Backend sends initial request** with data for the first model
2. **Scheduler processes first model** and returns partial result
3. **Scheduler requests next data** (if more models remain)
4. **Backend sends next data** for the second model
5. **Repeat** until all models are processed
6. **Scheduler returns final aggregated result**

#### Intermediate Request from Scheduler

After processing each model (except the last), the scheduler will send:

```json
{
  "status": "partial",
  "message": "Please provide data for dxassist-screening",
  "model_index": 2,
  "total_models": 2,
  "current_model": "dxassist-screening",
  "previous_results": {
    "dxassist-angiography": {
      "coronary_disease_probability": 98
    }
  }
}
```

**Your Response (Next Data):**
```json
{
  "data": {
    "blood_test": "base64_encoded_or_text_data",
  }
}
```

#### Final Response

After all models are processed:

```json
{
  "aggregated": {
    "coronary_disease_probability": 81.2
  },
  "details": {
    "dxassist-angiography": {
      "coronary_disease_probability": 98
    },
    "dxassist-screening": {
      "atherosclerosis_risk": 72,
      "inflammation_marker": "elevated"
    }
  },
  "weights": {
    "dxassist-angiography": 0.4,
    "dxassist-screening": 0.6
  },
  "combined_model": "dxassist-heartdisease"
}
```