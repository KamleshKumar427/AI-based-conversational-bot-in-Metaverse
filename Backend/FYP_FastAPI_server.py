# %pip install -U pip
# %pip install bitsandbytes
# %pip install torch==2.0.1
# %pip install -U git+https://github.com/huggingface/transformers.git@e03a9cc
# %pip install -U git+https://github.com/huggingface/peft.git
# # %pip install -U git+https://github.com/huggingface/peft.git@42a184f
# %pip install -U git+https://github.com/huggingface/accelerate.git
# %pip install datasets==2.12.0
# %pip install loralib==0.1.1
# %pip install einops==0.6.1



import json
import os
from pprint import pprint
import warnings

import bitsandbytes as bnb
import torch
import torch.nn as nn
import transformers
from datasets import load_dataset
from huggingface_hub import notebook_login, HfFolder
from langchain.memory import ConversationBufferMemory

from peft import (
    LoraConfig,
    PeftConfig,
    PeftModel,
    get_peft_model,
    prepare_model_for_kbit_training
)
from transformers import (
    AutoConfig,
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig
)

os.environ["CUDA_VISIBLE_DEVICES"] = "0"

# Import necessary libraries
from langchain.llms import HuggingFacePipeline
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationChain

print("done importing")




from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows access from all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

from huggingface_hub import HfApi
api = HfApi()


warnings.filterwarnings("ignore")

# Loading the model and tokenizer
def Load_model():
    MODEL_NAME = "meta-llama/Llama-2-7b-chat-hf"

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        device_map="auto",
        trust_remote_code=True,
        quantization_config=bnb_config
    )

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token

    config = LoraConfig(
        r=16,
        lora_alpha=32,
        # target_modules=["query_key_value"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )

    model = get_peft_model(model, config)

    generation_config = model.generation_config
    generation_config.max_new_tokens = 100
    generation_config.temperature = 0.7
    generation_config.top_p = 0.7
    generation_config.num_return_sequences = 1
    generation_config.pad_token_id = tokenizer.eos_token_id
    generation_config.eos_token_id = tokenizer.eos_token_id


    pipeline = transformers.pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        torch_dtype=torch.bfloat16,
        trust_remote_code=True,
        device_map="auto",
        max_length=10000,
        do_sample=True,
        top_k=10,
        num_return_sequences=1,
        eos_token_id=tokenizer.eos_token_id
    )

    return pipeline



pipeline = Load_model()

llm = HuggingFacePipeline(pipeline=pipeline, model_kwargs={'temperature':0.7})

# Extra Code
# Do not/Never include emojis or special characters in response
def langchain_setup():
    teacher_prompt_template = """
<s>[INST] <<SYS>>
    {{ You are a teacher. Your role is to deliver lectures on specific topics requested by the student. After the lecture, the student may ask questions related to the topic, and you should provide clear and informative answers. And if there is any question then answer that question.}}<<SYS>>

    ###

    Previous Conversation:
    '''
    {history}
    '''

    {{{input}}}[/INST]

    """
    prompt = PromptTemplate(template=teacher_prompt_template, input_variables=['input', 'history'])

    chain = ConversationChain(llm=llm, prompt=prompt)

    return chain

chain = langchain_setup()

def Model_interaction(param1: str):
    teacher_response = chain.run(f"{param1}.")
    return teacher_response


# teacher_response = Model_interaction("Teach me parts of speech in details, teacher")
# print(teacher_response)


# Server Code
# class TeacherRequest(BaseModel):
#     param1: str

# @app.post("/interact_with_teacher/")
# async def assesment_response_endpoint(request: TeacherRequest):
#     result = Model_interaction(request.param1)
#     return {"result": result}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8080)


class LogMessage(BaseModel):
    message: str

@app.post("/log_message/")
async def log_message_endpoint(log: LogMessage):
    print("Log received:", log.message)
    return {"status": "Success", "message": "Log received"}

class TeacherRequest(BaseModel):
    param1: str
    email: str

@app.post("/interact_with_teacher/")
async def assessment_response_endpoint(request: TeacherRequest):
    result = Model_interaction(request.param1)
    return {"result": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

