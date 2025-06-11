import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QLabel, QPushButton, QMessageBox

class SimpleTestWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("机器视觉文献获取系统 - 测试版")
        self.setGeometry(100, 100, 400, 300)
        
        # 创建主widget
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        
        # 创建布局
        layout = QVBoxLayout(main_widget)
        
        # 添加标签
        label = QLabel("机器视觉文献获取系统")
        label.setStyleSheet("font-size: 18px; font-weight: bold; padding: 20px;")
        layout.addWidget(label)
        
        # 添加按钮
        test_button = QPushButton("测试按钮")
        test_button.clicked.connect(self.show_message)
        layout.addWidget(test_button)
        
        status_label = QLabel("系统状态：已启动")
        layout.addWidget(status_label)
        
    def show_message(self):
        QMessageBox.information(self, "测试", "GUI系统运行正常！")

def main():
    print("正在启动GUI...")
    app = QApplication(sys.argv)
    window = SimpleTestWindow()
    window.show()
    print("GUI窗口已显示")
    sys.exit(app.exec())

if __name__ == "__main__":
    main()