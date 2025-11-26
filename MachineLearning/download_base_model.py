import os
from transformers import ASTForAudioClassification, ASTFeatureExtractor

model_name = "MIT/ast-finetuned-audioset-10-10-0.4593"

print(f"Downloading {model_name} for baking into Docker image . . . ")

ASTFeatureExtractor.from_pretrained(model_name)
ASTForAudioClassification.from_pretrained(model_name)

print("Success: Base model downloaded and cached.")