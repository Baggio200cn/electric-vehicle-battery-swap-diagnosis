import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  MarkAsUnread as MarkUnreadIcon,
  MarkEmailRead as MarkReadIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Computer as SystemIcon,
  Security as SecurityIcon,
  Update as UpdateIcon
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'security' | 'update' | 'user' | 'diagnosis';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  source: string;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationUpdate: (notifications: Notification[]) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onClose,
  notifications,
  onNotificationUpdate
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enableSound: true,
    enableDesktop: true,
    enableEmail: false,
    autoMarkRead: true,
    showPreview: true
  });
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  // 获取未读通知数量
  const unreadCount = notifications.filter(n => !n.read).length;

  // 按类型过滤通知
  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notification.read;
    return notification.type === filterType || notification.category === filterType;
  });

  // 按优先级和时间排序
  const sortedNotifications = filteredNotifications.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 获取通知图标
  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'security') return <SecurityIcon />;
    if (category === 'update') return <UpdateIcon />;
    if (category === 'user') return <PersonIcon />;
    if (category === 'system') return <SystemIcon />;
    
    switch (type) {
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'success': return <SuccessIcon color="success" />;
      default: return <InfoIcon color="info" />;
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  // 标记为已读
  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    onNotificationUpdate(updatedNotifications);
  };

  // 标记为未读
  const markAsUnread = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: false } : n
    );
    onNotificationUpdate(updatedNotifications);
  };

  // 删除通知
  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    onNotificationUpdate(updatedNotifications);
  };

  // 全部标记为已读
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    onNotificationUpdate(updatedNotifications);
  };

  // 清空所有通知
  const clearAllNotifications = () => {
    onNotificationUpdate([]);
  };

  // 格式化时间
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return timestamp.toLocaleDateString();
  };

  // 渲染通知列表
  const renderNotificationList = () => (
    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
      {sortedNotifications.length === 0 ? (
        <ListItem>
          <ListItemText
            primary="暂无通知"
            secondary="您的通知将显示在这里"
            sx={{ textAlign: 'center' }}
          />
        </ListItem>
      ) : (
        sortedNotifications.map((notification) => (
          <ListItem
            key={notification.id}
            sx={{
              bgcolor: notification.read ? 'transparent' : 'action.hover',
              borderLeft: notification.read ? 'none' : `4px solid ${
                notification.type === 'error' ? 'error.main' :
                notification.type === 'warning' ? 'warning.main' :
                notification.type === 'success' ? 'success.main' : 'info.main'
              }`
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 40, height: 40 }}>
                {getNotificationIcon(notification.type, notification.category)}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                    {notification.title}
                  </Typography>
                  <Chip
                    label={notification.priority}
                    size="small"
                    color={getPriorityColor(notification.priority) as any}
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(notification.timestamp)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • {notification.source}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {notification.actionable && (
                  <Tooltip title="执行操作">
                    <IconButton size="small" color="primary">
                      <ScheduleIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={notification.read ? "标记为未读" : "标记为已读"}>
                  <IconButton
                    size="small"
                    onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                  >
                    {notification.read ? <MarkUnreadIcon /> : <MarkReadIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton
                    size="small"
                    onClick={() => deleteNotification(notification.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      )}
    </List>
  );

  // 渲染设置面板
  const renderSettings = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        通知设置
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="声音提醒" secondary="新通知时播放提示音" />
          <ListItemSecondaryAction>
            <Switch
              checked={notificationSettings.enableSound}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                enableSound: e.target.checked
              }))}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="桌面通知" secondary="显示系统桌面通知" />
          <ListItemSecondaryAction>
            <Switch
              checked={notificationSettings.enableDesktop}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                enableDesktop: e.target.checked
              }))}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="邮件通知" secondary="重要通知发送邮件" />
          <ListItemSecondaryAction>
            <Switch
              checked={notificationSettings.enableEmail}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                enableEmail: e.target.checked
              }))}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="自动标记已读" secondary="查看通知后自动标记为已读" />
          <ListItemSecondaryAction>
            <Switch
              checked={notificationSettings.autoMarkRead}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                autoMarkRead: e.target.checked
              }))}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="显示预览" secondary="在通知列表中显示消息预览" />
          <ListItemSecondaryAction>
            <Switch
              checked={notificationSettings.showPreview}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                showPreview: e.target.checked
              }))}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
          <Typography variant="h6">通知中心</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="筛选">
            <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="设置">
            <IconButton onClick={() => setShowSettings(!showSettings)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {showSettings ? (
          renderSettings()
        ) : (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label={`全部 (${notifications.length})`} />
                <Tab label={`未读 (${unreadCount})`} />
                <Tab label="系统" />
                <Tab label="安全" />
              </Tabs>
            </Box>
            {renderNotificationList()}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!showSettings && (
          <>
            <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
              全部已读
            </Button>
            <Button onClick={clearAllNotifications} color="error" disabled={notifications.length === 0}>
              清空全部
            </Button>
          </>
        )}
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>

      {/* 筛选菜单 */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setFilterType('all'); setFilterMenuAnchor(null); }}>
          全部通知
        </MenuItem>
        <MenuItem onClick={() => { setFilterType('unread'); setFilterMenuAnchor(null); }}>
          未读通知
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setFilterType('error'); setFilterMenuAnchor(null); }}>
          错误通知
        </MenuItem>
        <MenuItem onClick={() => { setFilterType('warning'); setFilterMenuAnchor(null); }}>
          警告通知
        </MenuItem>
        <MenuItem onClick={() => { setFilterType('info'); setFilterMenuAnchor(null); }}>
          信息通知
        </MenuItem>
        <MenuItem onClick={() => { setFilterType('success'); setFilterMenuAnchor(null); }}>
          成功通知
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default NotificationCenter; 