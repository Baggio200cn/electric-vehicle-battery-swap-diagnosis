import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Computer as DesktopIcon,
  VolumeUp as VolumeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudDownload as ExportIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  role: string;
  department: string;
  joinDate: string;
  lastLogin: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      desktop: boolean;
      sound: boolean;
    };
    privacy: {
      profileVisible: boolean;
      activityVisible: boolean;
      dataSharing: boolean;
    };
  };
}

interface UserSettingsProps {
  open: boolean;
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-001',
    username: 'admin',
    email: 'admin@example.com',
    fullName: '系统管理员',
    avatar: '',
    role: '管理员',
    department: '技术部',
    joinDate: '2024-01-01',
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      notifications: {
        email: true,
        sms: false,
        desktop: true,
        sound: true
      },
      privacy: {
        profileVisible: true,
        activityVisible: false,
        dataSharing: true
      }
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // 保存设置
  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // 重置设置
  const handleResetSettings = () => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        notifications: {
          email: true,
          sms: false,
          desktop: true,
          sound: true
        },
        privacy: {
          profileVisible: true,
          activityVisible: false,
          dataSharing: true
        }
      }
    }));
  };

  // 修改密码
  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('新密码确认不匹配');
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('密码修改成功');
      setShowPasswordDialog(false);
      setPasswordData({
        current: '',
        new: '',
        confirm: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
    } catch (error) {
      alert('密码修改失败');
    }
  };

  // 导出数据
  const handleExportData = () => {
    const dataToExport = {
      profile: userProfile,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 渲染个人资料标签页
  const renderProfileTab = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                src={userProfile.avatar}
              >
                {userProfile.fullName.charAt(0)}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {userProfile.fullName}
              </Typography>
              <Chip label={userProfile.role} color="primary" sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {userProfile.department}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? '取消编辑' : '编辑资料'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="用户名"
                    value={userProfile.username}
                    disabled={!editMode}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="邮箱"
                    value={userProfile.email}
                    disabled={!editMode}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="姓名"
                    value={userProfile.fullName}
                    disabled={!editMode}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      fullName: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="部门"
                    value={userProfile.department}
                    disabled={!editMode}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                账户信息
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="注册时间"
                    secondary={new Date(userProfile.joinDate).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="最后登录"
                    secondary={new Date(userProfile.lastLogin).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="密码" secondary="••••••••" />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      修改密码
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // 渲染偏好设置标签页
  const renderPreferencesTab = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThemeIcon />
                外观设置
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>主题模式</FormLabel>
                <RadioGroup
                  value={userProfile.preferences.theme}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      theme: e.target.value as 'light' | 'dark' | 'auto'
                    }
                  }))}
                >
                  <FormControlLabel value="light" control={<Radio />} label="浅色模式" />
                  <FormControlLabel value="dark" control={<Radio />} label="深色模式" />
                  <FormControlLabel value="auto" control={<Radio />} label="跟随系统" />
                </RadioGroup>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>语言</InputLabel>
                <Select
                  value={userProfile.preferences.language}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      language: e.target.value
                    }
                  }))}
                >
                  <MenuItem value="zh-CN">简体中文</MenuItem>
                  <MenuItem value="zh-TW">繁体中文</MenuItem>
                  <MenuItem value="en-US">English</MenuItem>
                  <MenuItem value="ja-JP">日本語</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>时区</InputLabel>
                <Select
                  value={userProfile.preferences.timezone}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      timezone: e.target.value
                    }
                  }))}
                >
                  <MenuItem value="Asia/Shanghai">北京时间 (UTC+8)</MenuItem>
                  <MenuItem value="Asia/Tokyo">东京时间 (UTC+9)</MenuItem>
                  <MenuItem value="America/New_York">纽约时间 (UTC-5)</MenuItem>
                  <MenuItem value="Europe/London">伦敦时间 (UTC+0)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon />
                通知设置
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary="邮件通知" secondary="接收重要系统通知" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={userProfile.preferences.notifications.email}
                      onChange={(e) => setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            email: e.target.checked
                          }
                        }
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SmsIcon />
                  </ListItemIcon>
                  <ListItemText primary="短信通知" secondary="紧急情况短信提醒" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={userProfile.preferences.notifications.sms}
                      onChange={(e) => setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            sms: e.target.checked
                          }
                        }
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DesktopIcon />
                  </ListItemIcon>
                  <ListItemText primary="桌面通知" secondary="浏览器桌面推送" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={userProfile.preferences.notifications.desktop}
                      onChange={(e) => setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            desktop: e.target.checked
                          }
                        }
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <VolumeIcon />
                  </ListItemIcon>
                  <ListItemText primary="声音提醒" secondary="通知声音提示" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={userProfile.preferences.notifications.sound}
                      onChange={(e) => setUserProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            sound: e.target.checked
                          }
                        }
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // 渲染隐私设置标签页
  const renderPrivacyTab = () => (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon />
            隐私与安全
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary="个人资料可见性"
                secondary="允许其他用户查看您的基本信息"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={userProfile.preferences.privacy.profileVisible}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      privacy: {
                        ...prev.preferences.privacy,
                        profileVisible: e.target.checked
                      }
                    }
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="活动记录可见性"
                secondary="允许显示您的系统使用记录"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={userProfile.preferences.privacy.activityVisible}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      privacy: {
                        ...prev.preferences.privacy,
                        activityVisible: e.target.checked
                      }
                    }
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="数据共享"
                secondary="允许系统收集使用数据以改进服务"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={userProfile.preferences.privacy.dataSharing}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      privacy: {
                        ...prev.preferences.privacy,
                        dataSharing: e.target.checked
                      }
                    }
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            数据管理
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportData}
              >
                导出数据
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetSettings}
              >
                重置设置
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                删除账户
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          用户设置
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<PersonIcon />} label="个人资料" />
            <Tab icon={<SettingsIcon />} label="偏好设置" />
            <Tab icon={<SecurityIcon />} label="隐私安全" />
          </Tabs>
        </Box>
        
        {activeTab === 0 && renderProfileTab()}
        {activeTab === 1 && renderPreferencesTab()}
        {activeTab === 2 && renderPrivacyTab()}
      </DialogContent>
      
      <DialogActions>
        {saveStatus === 'success' && (
          <Alert severity="success" sx={{ mr: 2 }}>
            设置已保存
          </Alert>
        )}
        {saveStatus === 'error' && (
          <Alert severity="error" sx={{ mr: 2 }}>
            保存失败
          </Alert>
        )}
        <Button onClick={onClose}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
          startIcon={<SaveIcon />}
        >
          {saveStatus === 'saving' ? '保存中...' : '保存设置'}
        </Button>
      </DialogActions>

      {/* 修改密码对话框 */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>修改密码</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="当前密码"
                type={passwordData.showCurrent ? 'text' : 'password'}
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setPasswordData(prev => ({ ...prev, showCurrent: !prev.showCurrent }))}
                    >
                      {passwordData.showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="新密码"
                type={passwordData.showNew ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setPasswordData(prev => ({ ...prev, showNew: !prev.showNew }))}
                    >
                      {passwordData.showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="确认新密码"
                type={passwordData.showConfirm ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setPasswordData(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                    >
                      {passwordData.showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
          >
            确认修改
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default UserSettings; 