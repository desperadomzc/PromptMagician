# diffusiondb
n_imgs = 100000
batch_size = 1000

# common
n_search = 10
n_compress = 0.2
n_test = 5

# stable diffusion
# model_id = "CompVis/stable-diffusion-v1-4"
canny_model_id = "lllyasviel/sd-controlnet-canny"
depth_model_id = "lllyasviel/sd-controlnet-depth"
hed_model_id = "lllyasviel/sd-controlnet-hed"
mlsd_model_id = "lllyasviel/sd-controlnet-mlsd"
openpose_model_id = "lllyasviel/sd-controlnet-openpose"
scribble_model_id = "lllyasviel/sd-controlnet-scribble"
seg_model_id = "lllyasviel/sd-controlnet_seg"

sd_model_id = "runwayml/stable-diffusion-v1-5"
sd_height = 512
sd_width = 512
n_inference_steps = 50
n_images_per_prompt = 7
# n_epo = 1 # one epo cost 20s
n_device = 1  # number of GPU
sd_ip = 'http://127.0.0.1:'
rand_left = 212463292853
rand_right = 958446223563
