from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import numpy as np
from transformers import pipeline
import os
import tempfile
import cv2
from PIL import Image
import io
from werkzeug.utils import secure_filename
import logging

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 配置上传文件的设置
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_uploads')
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'webm', 'mov'}
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB

# 确保上传目录存在
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    logger.info(f"创建上传目录: {UPLOAD_FOLDER}")

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# 加载预训练模型
classifier = pipeline("text-classification", model="bert-base-chinese")

def transcribe_audio(audio_file):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio, language='zh-CN')
            return text
        except sr.UnknownValueError:
            return "无法识别音频内容"
        except sr.RequestError:
            return "语音识别服务出错"

def analyze_fault(text):
    # 这里使用简单的规则进行故障分类
    # 实际应用中应该使用更复杂的模型
    fault_types = {
        "变压器": {
            "keywords": ["变压器", "油温", "绝缘", "过热"],
            "solutions": [
                "检查冷却风扇运行状态",
                "检查负载分配情况",
                "进行绝缘测试"
            ]
        },
        "断路器": {
            "keywords": ["断路器", "跳闸", "开关"],
            "solutions": [
                "检查线路负载",
                "检查机械传动装置",
                "检查控制电路"
            ]
        }
    }

    # 简单的关键词匹配
    max_matches = 0
    detected_fault = None
    
    for fault_type, data in fault_types.items():
        matches = sum(1 for keyword in data["keywords"] if keyword in text)
        if matches > max_matches:
            max_matches = matches
            detected_fault = fault_type

    if detected_fault:
        fault_data = fault_types[detected_fault]
        confidence = min(max_matches / len(fault_data["keywords"]), 0.95)
        return {
            "faultType": f"{detected_fault}故障",
            "confidence": confidence,
            "solutions": fault_data["solutions"]
        }
    else:
        return {
            "faultType": "未知故障",
            "confidence": 0.3,
            "solutions": ["请提供更详细的故障描述"]
        }

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_video_frame(frame):
    """处理视频帧，检测可能的故障"""
    try:
        # 转换为灰度图
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 应用高斯模糊减少噪声
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # 使用Canny边缘检测
        edges = cv2.Canny(blurred, 50, 150)
        
        # 查找轮廓
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # 分析轮廓特征
        abnormal_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 100:  # 过滤小轮廓
                x, y, w, h = cv2.boundingRect(contour)
                abnormal_regions.append({
                    'x': int(x),
                    'y': int(y),
                    'width': int(w),
                    'height': int(h),
                    'area': int(area)
                })
        
        return {
            'abnormalRegions': abnormal_regions,
            'edgeCount': len(contours)
        }
    except Exception as e:
        logger.error(f"处理视频帧时出错: {str(e)}")
        return None

def analyze_video_file(video_path):
    """分析视频文件并返回结果"""
    cap = cv2.VideoCapture(video_path)
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps
    
    # 模拟异常检测
    abnormal_frames = np.random.randint(0, total_frames // 4)
    abnormal_ratio = abnormal_frames / total_frames
    
    cap.release()
    
    return {
        "analysis": {
            "faultType": "设备异常",
            "confidence": 0.85,
            "solutions": [
                "检查冷却系统",
                "进行设备维护",
                "调整电压参数"
            ]
        },
        "statistics": {
            "totalFrames": total_frames,
            "analyzedFrames": total_frames,
            "abnormalFrames": abnormal_frames,
            "abnormalRatio": abnormal_ratio,
            "duration": duration
        }
    }

def analyze_text_description(text):
    """分析文本描述并返回结果"""
    return {
        "analysis": f"根据您的描述：\n\n{text}\n\n初步诊断结果：\n1. 可能存在设备老化问题\n2. 建议进行预防性维护\n3. 需要进一步现场检查"
    }

@app.route('/api/analyze/audio', methods=['POST'])
def analyze_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "没有收到音频文件"}), 400
    
    audio_file = request.files['audio']
    
    # 保存音频文件到临时目录
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
        audio_file.save(temp_audio.name)
        text = transcribe_audio(temp_audio.name)
    
    # 删除临时文件
    os.unlink(temp_audio.name)
    
    if text == "无法识别音频内容" or text == "语音识别服务出错":
        return jsonify({"error": text}), 400
    
    result = analyze_fault(text)
    return jsonify({"text": text, "analysis": result})

@app.route('/api/analyze/text', methods=['POST'])
def analyze_text():
    if not request.json or 'text' not in request.json:
        return jsonify({"error": "没有收到文本数据"}), 400
    
    text = request.json['text']
    result = analyze_fault(text)
    return jsonify({"analysis": result})

@app.route('/api/analyze/frame', methods=['POST'])
def analyze_frame():
    if 'frame' not in request.files:
        return jsonify({"error": "没有收到视频帧"}), 400
    
    try:
        frame_file = request.files['frame']
        frame_data = frame_file.read()
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "无法解析视频帧"}), 400
        
        # 处理视频帧
        analysis_result = process_video_frame(frame)
        
        if analysis_result is None:
            return jsonify({"error": "处理视频帧时出错"}), 500
        
        # 基于分析结果生成诊断
        abnormal_count = len(analysis_result['abnormalRegions'])
        if abnormal_count > 0:
            confidence = min(0.5 + (abnormal_count * 0.1), 0.95)
            result = {
                "faultType": "设备异常",
                "confidence": confidence,
                "solutions": [
                    "检查标记区域的设备状态",
                    "进行详细的设备检查",
                    "考虑进行预防性维护"
                ]
            }
        else:
            result = {
                "faultType": "正常运行",
                "confidence": 0.8,
                "solutions": ["继续定期监控"]
            }
        
        return jsonify({
            "analysis": result,
            "details": analysis_result
        })
    except Exception as e:
        return jsonify({"error": f"处理视频帧时出错: {str(e)}"}), 500

@app.route('/analyze/video', methods=['POST'])
def analyze_video():
    if 'video' not in request.files:
        return jsonify({"error": "没有上传视频文件"}), 400
    
    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({"error": "未选择文件"}), 400
    
    # 创建临时文件保存上传的视频
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, secure_filename(video_file.filename))
    
    try:
        video_file.save(temp_path)
        result = analyze_video_file(temp_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # 清理临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)
        os.rmdir(temp_dir)

@app.route('/analyze/text', methods=['POST'])
def analyze_text_description():
    if not request.is_json:
        return jsonify({"error": "请求必须是JSON格式"}), 400
    
    data = request.get_json()
    if 'text' not in data:
        return jsonify({"error": "缺少文本描述"}), 400
    
    result = analyze_fault(data['text'])
    return jsonify({
        "analysis": result
    })

if __name__ == '__main__':
    logger.info("启动服务器...")
    app.run(debug=True, port=5000) 