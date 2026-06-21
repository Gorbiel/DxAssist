PROTOTYPE_MODELS = [
    {
        "id": "dxassist-angiography",
        "name": "Angiography",
        "type": "single",
        "description": "Coronary angiography image analysis.",
        "input_schema": {
            "image": "Base64-encoded angiography image.",
        },
    },
    {
        "id": "dxassist-screening",
        "name": "Blood screening",
        "type": "single",
        "description": "Blood-test screening analysis.",
        "input_schema": {
            "blood_test": "Base64-encoded or plain-text blood-test data.",
        },
    },
    {
        "id": "dxassist-heartdisease",
        "name": "Heart disease",
        "type": "combined",
        "description": "Combined angiography and blood screening analysis.",
        "input_schema": {
            "image": "Base64-encoded angiography image for the first model.",
        },
        "additional_data_schema": {
            "dxassist-screening": {
                "blood_test": "Base64-encoded or plain-text blood-test data.",
            },
        },
    },
]
