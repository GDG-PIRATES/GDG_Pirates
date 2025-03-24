import google.generativeai as genai

genai.configure(api_key="AIzaSyD3gUnZ6EiZTLOmaWtVtTOeeormH8V37zE")

models = genai.list_models()
for model in models:
    print(model.name)