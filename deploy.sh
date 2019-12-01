#!/bin/bash

cd ~/workspace/ExamReg/backend
git pull
export PATH=$PATH:$1
$1/npm install
$1/pm2 restart exam_reg_backend
