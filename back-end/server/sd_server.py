from flask import Flask, render_template, request, make_response
from flask_cors import *
import torch
import json
import clip
import base64
from io import BytesIO
from util import *
# from workflow import *
import scipy.cluster.hierarchy as sch
from workflow import tfidf_of_cluster
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
import torch
import sys
import numpy
import time
from config import *
import random
import urllib.parse

app = Flask(__name__)
CORS(app, supports_credentials=True)

device_id = sys.argv[1]
device = "cuda:" + device_id
print(device)

print("Begin to load model")
####################
# load control net and stable diffusion v1-5
controlnet_canny = ControlNetModel.from_pretrained(canny_model_id, torch_dtype=torch.float16)
controlnet_depth = ControlNetModel.from_pretrained(depth_model_id, torch_dtype=torch.float16)
controlnet_openpose = ControlNetModel.from_pretrained(openpose_model_id, torch_dtype=torch.float16)
controlnet_scribble = ControlNetModel.from_pretrained(scribble_model_id, torch_dtype=torch.float16)

pipe_canny = StableDiffusionControlNetPipeline.from_pretrained(
    sd_model_id, controlnet=controlnet_canny, torch_dtype=torch.float16
)
pipe_depth = StableDiffusionControlNetPipeline.from_pretrained(
    sd_model_id, controlnet=controlnet_depth, torch_dtype=torch.float16
)
pipe_openpose = StableDiffusionControlNetPipeline.from_pretrained(
    sd_model_id, controlnet=controlnet_openpose, torch_dtype=torch.float16
)
pipe_scribble = StableDiffusionControlNetPipeline.from_pretrained(
    sd_model_id, controlnet=controlnet_scribble, torch_dtype=torch.float16
)

# speed up diffusion process with faster scheduler and memory optimization
pipe_canny.scheduler = UniPCMultistepScheduler.from_config(pipe_canny.scheduler.config)
pipe_depth.scheduler = UniPCMultistepScheduler.from_config(pipe_depth.scheduler.config)
pipe_openpose.scheduler = UniPCMultistepScheduler.from_config(pipe_openpose.scheduler.config)
pipe_scribble.scheduler = UniPCMultistepScheduler.from_config(pipe_scribble.scheduler.config)
####################

# Use the DPMSolverMultistepScheduler (DPM-Solver++) scheduler here instead
# pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16, force_download=True)
# pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

print("Set device")
pipe_canny = pipe_canny.to(device)
pipe_depth = pipe_depth.to(device)
pipe_openpose = pipe_openpose.to(device)
pipe_scribble = pipe_scribble.to(device)
print("Start inference")

pipe_dict = {
    'canny': pipe_canny,
    'depth': pipe_depth,
    'openpose': pipe_openpose,
    'scribble': pipe_scribble
}


@app.route('/sd')
def sd():
    args = request.args
    epo = int(args.get('epo'))
    device_id = int(args.get('device_id'))
    scale_left = float(args.get('scale_left'))
    scale_right = float(args.get('scale_right'))
    prompt = args.get('prompt')
    negative_prompt = args.get('negative_prompt')
    select_model = args.get('select_model')
    image_url = args.get('image_url')

    # decode the image_url
    if image_url and image_url != '':
        image_url = urllib.parse.unquote(image_url)
    else:
        raise ValueError("Please provide legal image url!")

    # set scale listm
    w_list = []
    while (scale_left <= scale_right):
        w_list.append(scale_left)
        scale_left += 0.5
    w_len = len(w_list)
    print('Guidance scale sample list:', w_list)

    processed_image = process_image(select_model, image_url)
    selected_pipe = pipe_dict[select_model]

    result_dict = []
    for i in range(int(epo)):
        st = time.time()
        scale = w_list[random.randrange(0, w_len)]

        # set seed
        generators = []
        seed_list = []
        for i in range(n_images_per_prompt):
            seed = random.randrange(2 ** 32 - 1)
            generator = torch.Generator(device='cuda')
            generator = generator.manual_seed(seed)
            generators.append(generator)
            seed_list.append(seed)

        if len(negative_prompt) == 0:
            print('negative_prompt is None')
            # images = pipe(prompt = prompt, height = sd_height, width = sd_width, num_inference_steps = n_inference_steps,
            #     guidance_scale = float(scale), num_images_per_prompt = n_images_per_prompt, generator  = generators)
            images = selected_pipe(image=processed_image, prompt=prompt, height=sd_height, width=sd_width,
                                   num_inference_steps=n_inference_steps,
                                   guidance_scale=float(scale), num_images_per_prompt=n_images_per_prompt,
                                   generator=generators)
        else:
            print('negative_prompt is', negative_prompt)
            # images = pipe(prompt = prompt, height = sd_height, width = sd_width, num_inference_steps = n_inference_steps,
            #     guidance_scale = float(scale), negative_prompt = negative_prompt, num_images_per_prompt = n_images_per_prompt, generator  = generators)
            images = selected_pipe(image=processed_image, prompt=prompt, height=sd_height, width=sd_width,
                                   num_inference_steps=n_inference_steps,
                                   guidance_scale=float(scale), negative_prompt=negative_prompt,
                                   num_images_per_prompt=n_images_per_prompt, generator=generators)
        print("[Infer time: {0}]".format(time.time() - st))

        for j in range(0, n_images_per_prompt):
            inner = {}
            image = images.images[j]
            inner['id'] = str(device_id * n_images_per_prompt * epo + n_images_per_prompt * i + j)
            inner['img'] = getImgStr(image)
            inner['x'] = str(sd_width)
            inner['y'] = str(sd_height)
            inner['guidanceScale'] = str(scale)
            inner['seed'] = str(seed_list[j])

            result_dict.append(inner)

    return json.dumps(result_dict)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, threaded=True, port=5005)
