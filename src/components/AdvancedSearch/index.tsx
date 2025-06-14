import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  BugReport as DiagnosisIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface SearchFilter {
  type: string[];
  category: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  severity: string[];
  tags: string[];
  confidence: [number, number];
  size: [number, number];
}

interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'diagnosis';
  category: string;
  description: string;
  tags: string[];
  date: Date;
  size: number;
  confidence?: number;
  severity?: 'low' | 'medium' | 'high';
  relevanceScore: number;
  thumbnail?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter;
  createdAt: Date;
  resultCount: number;
}

interface AdvancedSearchProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: SearchFilter) => Promise<SearchResult[]>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ open, onClose, onSearch }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({
    type: [],
    category: [],
    dateRange: { start: null, end: null },
    severity: [],
    tags: [],
    confidence: [0, 100],
    size: [0, 1000]
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 模拟搜索结果
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: '电池连接器故障诊断报告',
      type: 'diagnosis',
      category: '电气故障',
      description: '电池连接器接触电阻过大，导致充电效率下降',
      tags: ['电池', '连接器', '故障', '诊断'],
      date: new Date('2024-01-15'),
      size: 2.5,
      confidence: 92,
      severity: 'high',
      relevanceScore: 95
    },
    {
      id: '2',
      title: '机械手臂维护手册',
      type: 'document',
      category: '维护文档',
      description: '换电站机械手臂的日常维护和故障排除指南',
      tags: ['机械手臂', '维护', '手册'],
      date: new Date('2024-01-10'),
      size: 15.8,
      relevanceScore: 88
    },
    {
      id: '3',
      title: '换电站安全检查视频',
      type: 'video',
      category: '安全培训',
      description: '换电站日常安全检查流程演示视频',
      tags: ['安全', '检查', '培训'],
      date: new Date('2024-01-08'),
      size: 125.6,
      relevanceScore: 82
    }
  ];

  // 执行搜索
  const handleSearch = async () => {
    if (!query.trim() && Object.values(filters).every(f => 
      Array.isArray(f) ? f.length === 0 : 
      typeof f === 'object' && f !== null ? Object.values(f).every(v => v === null || (Array.isArray(v) && v.length === 2 && v[0] === 0)) :
      false
    )) {
      return;
    }

    setLoading(true);
    try {
      // 添加到搜索历史
      if (query.trim() && !searchHistory.includes(query.trim())) {
        setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
      }

      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 过滤和排序结果
      let filteredResults = mockResults.filter(result => {
        // 文本匹配
        const textMatch = !query.trim() || 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        // 类型过滤
        const typeMatch = filters.type.length === 0 || filters.type.includes(result.type);

        // 分类过滤
        const categoryMatch = filters.category.length === 0 || filters.category.includes(result.category);

        // 严重程度过滤
        const severityMatch = filters.severity.length === 0 || 
          (result.severity && filters.severity.includes(result.severity));

        // 置信度过滤
        const confidenceMatch = !result.confidence || 
          (result.confidence >= filters.confidence[0] && result.confidence <= filters.confidence[1]);

        return textMatch && typeMatch && categoryMatch && severityMatch && confidenceMatch;
      });

      // 排序
      filteredResults.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'relevance':
            comparison = b.relevanceScore - a.relevanceScore;
            break;
          case 'date':
            comparison = b.date.getTime() - a.date.getTime();
            break;
          case 'size':
            comparison = b.size - a.size;
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          default:
            comparison = 0;
        }
        return sortOrder === 'desc' ? comparison : -comparison;
      });

      setResults(filteredResults);
      setPage(1);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    setFilters({
      type: [],
      category: [],
      dateRange: { start: null, end: null },
      severity: [],
      tags: [],
      confidence: [0, 100],
      size: [0, 1000]
    });
    setResults([]);
    setPage(1);
  };

  // 保存搜索
  const handleSaveSearch = () => {
    if (!saveSearchName.trim()) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName.trim(),
      query,
      filters: { ...filters },
      createdAt: new Date(),
      resultCount: results.length
    };

    setSavedSearches(prev => [newSavedSearch, ...prev]);
    setShowSaveDialog(false);
    setSaveSearchName('');
  };

  // 加载保存的搜索
  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    handleSearch();
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <DocumentIcon />;
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'audio': return <AudioIcon />;
      case 'diagnosis': return <DiagnosisIcon />;
      default: return <DocumentIcon />;
    }
  };

  // 格式化文件大小
  const formatSize = (size: number) => {
    if (size < 1) return `${(size * 1024).toFixed(0)} KB`;
    if (size < 1024) return `${size.toFixed(1)} MB`;
    return `${(size / 1024).toFixed(1)} GB`;
  };

  // 分页结果
  const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          <Typography variant="h6">高级搜索</Typography>
          <Badge badgeContent={results.length} color="primary">
            <Chip label="结果" size="small" />
          </Badge>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ height: '100%' }}>
          {/* 搜索面板 */}
          <Grid item xs={12} md={4} sx={{ borderRight: 1, borderColor: 'divider', p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="输入搜索关键词..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={<SearchIcon />}
                  fullWidth
                >
                  {loading ? '搜索中...' : '搜索'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  startIcon={<ClearIcon />}
                >
                  清空
                </Button>
              </Box>
            </Box>

            {/* 搜索历史 */}
            {searchHistory.length > 0 && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon />
                    <Typography>搜索历史</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {searchHistory.map((historyItem, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => {
                          setQuery(historyItem);
                          handleSearch();
                        }}
                      >
                        <ListItemText primary={historyItem} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* 过滤器 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon />
                  <Typography>过滤条件</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* 文件类型 */}
                  <FormControl fullWidth>
                    <InputLabel>文件类型</InputLabel>
                    <Select
                      multiple
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as string[] }))}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="document">文档</MenuItem>
                      <MenuItem value="image">图片</MenuItem>
                      <MenuItem value="video">视频</MenuItem>
                      <MenuItem value="audio">音频</MenuItem>
                      <MenuItem value="diagnosis">诊断</MenuItem>
                    </Select>
                  </FormControl>

                  {/* 分类 */}
                  <FormControl fullWidth>
                    <InputLabel>分类</InputLabel>
                    <Select
                      multiple
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as string[] }))}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="电气故障">电气故障</MenuItem>
                      <MenuItem value="机械故障">机械故障</MenuItem>
                      <MenuItem value="维护文档">维护文档</MenuItem>
                      <MenuItem value="安全培训">安全培训</MenuItem>
                      <MenuItem value="系统概述">系统概述</MenuItem>
                    </Select>
                  </FormControl>

                  {/* 严重程度 */}
                  <FormControl fullWidth>
                    <InputLabel>严重程度</InputLabel>
                    <Select
                      multiple
                      value={filters.severity}
                      onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as string[] }))}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="low">低</MenuItem>
                      <MenuItem value="medium">中</MenuItem>
                      <MenuItem value="high">高</MenuItem>
                    </Select>
                  </FormControl>

                  {/* 置信度范围 */}
                  <Box>
                    <Typography gutterBottom>置信度范围</Typography>
                    <Slider
                      value={filters.confidence}
                      onChange={(_, newValue) => setFilters(prev => ({ ...prev, confidence: newValue as [number, number] }))}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100%' }
                      ]}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* 保存的搜索 */}
            {savedSearches.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon />
                    <Typography>保存的搜索</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {savedSearches.map((savedSearch) => (
                      <ListItem
                        key={savedSearch.id}
                        button
                        onClick={() => loadSavedSearch(savedSearch)}
                      >
                        <ListItemText
                          primary={savedSearch.name}
                          secondary={`${savedSearch.resultCount} 个结果 • ${savedSearch.createdAt.toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>

          {/* 结果面板 */}
          <Grid item xs={12} md={8} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                搜索结果 ({results.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>排序方式</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="relevance">相关性</MenuItem>
                    <MenuItem value="date">日期</MenuItem>
                    <MenuItem value="size">大小</MenuItem>
                    <MenuItem value="title">标题</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  startIcon={<SortIcon />}
                >
                  {sortOrder === 'desc' ? '降序' : '升序'}
                </Button>
                <Button
                  size="small"
                  onClick={() => setShowSaveDialog(true)}
                  startIcon={<SaveIcon />}
                  disabled={results.length === 0}
                >
                  保存搜索
                </Button>
              </Box>
            </Box>

            {/* 结果列表 */}
            <Box sx={{ mb: 2 }}>
              {paginatedResults.map((result) => (
                <Card key={result.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getTypeIcon(result.type)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {result.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {result.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          {result.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {result.date.toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatSize(result.size)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {result.category}
                          </Typography>
                          {result.confidence && (
                            <Chip
                              label={`${result.confidence}% 置信度`}
                              size="small"
                              color="info"
                            />
                          )}
                          {result.severity && (
                            <Chip
                              label={result.severity}
                              size="small"
                              color={
                                result.severity === 'high' ? 'error' :
                                result.severity === 'medium' ? 'warning' : 'success'
                              }
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {result.relevanceScore}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* 分页 */}
            {results.length > pageSize && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(results.length / pageSize)}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      {/* 保存搜索对话框 */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>保存搜索</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="搜索名称"
            value={saveSearchName}
            onChange={(e) => setSaveSearchName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>取消</Button>
          <Button onClick={handleSaveSearch} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AdvancedSearch; 