ps -ef | grep "sd_server" | grep -v "grep" | awk '{print $2}' | xargs kill -9
rm nohup.out

# 0-7 correspond to the GPU ID, run a thread for each GPU
#for i in 0
#do
#    nohup python -u sd_server.py $i &
#done

# only use cuda 3 on A1001 machine
nohup python -u sd_server.py 3 &
