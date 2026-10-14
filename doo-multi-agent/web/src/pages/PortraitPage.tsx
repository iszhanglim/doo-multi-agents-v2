import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { usePortraits } from '../hooks/usePortraits';
import { useClasses } from '../hooks/useClasses';
import { useScenarios } from '../hooks/useScenarios';
import { useAuth } from '../context/AuthContext';
import { getLevelColor } from '../utils/levelCalculator';
import type { ChildPortrait, DOOAssessment } from '../types';
import PortraitList from '../components/PortraitList';
import PortraitDetail from '../components/PortraitDetail';

const LEVEL_LABELS: Record<number, string> = {
  1: '初级·需支持',
  2: '初级·需支持',
  3: '中级·基本达成',
  4: '高级·表现优秀',
  5: '高级·表现优秀',
};

const DIMENSION_DETAILS = {
  diction: {
    name: '词句维度',
    icon: '📝',
    color: '#FF8C42',
    subDimensions: [
      { key: 'vocabulary', name: '词汇水平', description: '形容词、副词、描述性词汇的使用丰富度' },
      { key: 'sentenceStructure', name: '句子结构', description: '简单句、复合句、复杂句的使用情况' },
    ],
  },
  organization: {
    name: '组织维度',
    icon: '🧩',
    color: '#6B5B95',
    subDimensions: [
      { key: 'narrativeStructure', name: '叙事结构', description: '背景、角色定义、事件、结局的完整性' },
      { key: 'timeMarker', name: '时间标记', description: '时间连词和时间逻辑的使用情况' },
      { key: 'themeRelevance', name: '主题贴切', description: '故事线索的一致性和连续性' },
      { key: 'eventExpansion', name: '事件扩展', description: '细节描述的丰富程度和重要事件的阐述' },
      { key: 'expressiveness', name: '表现性', description: '声音效果、角色语气、表现力叙述的使用' },
    ],
  },
  opinion: {
    name: '观点维度',
    icon: '💭',
    color: '#88D8B0',
    subDimensions: [
      { key: 'narrativeViewpoint', name: '叙事观点', description: '个人感受、观点和评价的表达能力' },
    ],
  },
};

const PortraitPage: React.FC = () => {
  const { user } = useAuth();
  const { childId } = useParams();
  const { portraits, loading, deletePortrait } = usePortraits();
  const { classes } = useClasses();
  const { scenarios } = useScenarios();
  const [selectedChild, setSelectedChild] = useState<ChildPortrait | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const CLASS_NAME_MAP = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    classes.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [classes]);

  const SCENARIO_MAP = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    scenarios.forEach((s) => { map[s.id] = s.label; });
    return map;
  }, [scenarios]);

  const filteredPortraits = portraits.filter((p) =>
    p.name?.includes(searchTerm) || p.childId?.includes(searchTerm)
  );

  useEffect(() => {
    if (!childId || !portraits.length) return;
    const target = portraits.find((p) => p.childId === childId);
    if (target) setSelectedChild(target);
  }, [childId, portraits]);

  const getOverallScore = (radar: ChildPortrait['currentRadar']) => {
    return ((radar.diction + radar.organization + radar.opinion) / 3).toFixed(1);
  };

  const canDelete = (portrait: ChildPortrait) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'teacher' && user?.classId === portrait.classId) return true;
    return false;
  };

  const handleDelete = async (childId: string) => {
    if (!window.confirm('确定要删除该幼儿的画像吗？此操作不可恢复。')) return;
    setDeleting(true);
    const success = await deletePortrait(childId);
    if (success) {
      if (selectedChild?.childId === childId) {
        setSelectedChild(null);
      }
    }
    setDeleting(false);
  };

  const generatePortraitHTML = (portrait: ChildPortrait): string => {
    const overallScore = getOverallScore(portrait.currentRadar);
    const level = Math.round(parseFloat(overallScore));
    const assessments = portrait.basePortrait?.assessments || [];
    const latestAssessment = assessments[assessments.length - 1];
    const calcLevel = (dims: DOOAssessment['dimensions']) => {
      const d = (dims.diction.vocabulary + dims.diction.sentenceStructure) / 2;
      const o = (dims.organization.narrativeStructure + dims.organization.timeMarker + dims.organization.themeRelevance + dims.organization.eventExpansion + dims.organization.expressiveness) / 5;
      const op = dims.opinion.narrativeViewpoint;
      const avg = (d + o + op) / 3;
      if (avg >= 2.5) return 3;
      if (avg >= 1.5) return 2;
      return 1;
    };

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>DOO幼儿画像报告 - ${portrait.name || '未命名'}</title>
  <style>
    body { font-family: 'Segoe UI', 'PingFang SC', sans-serif; margin: 40px; color: #333; line-height: 1.8; }
    .header { text-align: center; border-bottom: 3px solid #FF8C42; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2D2A4A; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 10px 0 0; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
    .info-label { font-size: 12px; color: #888; font-weight: 600; }
    .info-value { font-size: 16px; color: #333; font-weight: 700; margin-top: 5px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #2D2A4A; border-left: 4px solid #FF8C42; padding-left: 15px; font-size: 20px; }
    .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .score-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; text-align: center; }
    .score-name { font-size: 14px; color: #666; }
    .score-value { font-size: 32px; font-weight: 700; color: #FF8C42; margin: 10px 0; }
    .dimension-detail { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
    .dimension-name { font-weight: 600; color: #2D2A4A; }
    .dimension-score { color: #FF8C42; font-weight: 700; }
    .assessment-item { border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
    .assessment-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .content-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; font-style: italic; }
    .suggestion-list { list-style: none; padding: 0; }
    .suggestion-list li { padding: 10px; background: #fff3cd; border-radius: 6px; margin-bottom: 8px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef; color: #888; font-size: 12px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 DOO 幼儿叙事能力画像报告</h1>
    <p>基于《学前儿童语言学习量表》的专业评估</p>
  </div>

  <div class="section">
    <h2>基本信息</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">姓名</div>
        <div class="info-value">${portrait.name || '未命名'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">班级</div>
        <div class="info-value">${CLASS_NAME_MAP[portrait.classId] || portrait.classId || '未分配'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">评估次数</div>
        <div class="info-value">${assessments.length} 次</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>综合评分</h2>
    <div class="score-grid">
      <div class="score-card">
        <div class="score-name">综合得分</div>
        <div class="score-value">${overallScore}<span style="font-size:14px"> / 5</span></div>
      </div>
      <div class="score-card">
        <div class="score-name">发展水平</div>
        <div class="score-value" style="font-size:24px">${LEVEL_LABELS[level] || '未知'}</div>
      </div>
      <div class="score-card">
        <div class="score-name">最近评估</div>
        <div class="score-value" style="font-size:20px;color:#6B5B95">${latestAssessment?.timestamp ? new Date(latestAssessment.timestamp).toLocaleDateString('zh-CN') : '暂无'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>雷达图评分</h2>
    ${(() => {
      const scores = [
        { key: 'diction', name: '词句维度', value: portrait.currentRadar.diction },
        { key: 'organization', name: '组织维度', value: portrait.currentRadar.organization },
        { key: 'opinion', name: '观点维度', value: portrait.currentRadar.opinion },
      ];
      return scores.map((s) => `
        <div class="score-item" style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-weight:600;">${s.name}</span>
          <span style="color:#FF8C42;font-weight:700;">${s.value.toFixed(1)} / 5</span>
        </div>
      `).join('');
    })()}
  </div>

  <div class="section">
    <h2>三维度详细分析</h2>
    ${Object.entries(DIMENSION_DETAILS).map(([dimKey, dimInfo]) => {
      const dimScore = portrait.currentRadar[dimKey as keyof typeof portrait.currentRadar];
      const dimData = latestAssessment?.dimensions[dimKey as keyof typeof latestAssessment.dimensions];
      return `
        <div class="dimension-detail">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span class="dimension-name">${dimInfo.icon} ${dimInfo.name}</span>
            <span class="dimension-score">${dimScore.toFixed(1)} 分</span>
          </div>
          ${dimInfo.subDimensions.map(sub => {
            const subScore = dimData?.[sub.key as keyof typeof dimData] || 1;
            return `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #ddd;">
                <span>${sub.name}：${sub.description}</span>
                <span style="color: ${getLevelColor(subScore)}; font-weight: 600;">${subScore} 级</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('')}
  </div>

  <div class="section">
    <h2>评估历史</h2>
    ${assessments.map((assessment, index) => `
      <div class="assessment-item">
        <div class="assessment-header">
          <strong>第 ${index + 1} 次评估</strong>
          <span>${assessment.timestamp ? new Date(assessment.timestamp).toLocaleString('zh-CN') : '未知时间'}</span>
        </div>
        <div><strong>评估场景：</strong>${SCENARIO_MAP[assessment.scenario || ''] || '智能故事角'}</div>
        <div class="content-box">${assessment.narrativeContent || '无内容记录'}</div>
        <div><strong>综合等级：</strong>等级 ${calcLevel(assessment.dimensions)} · ${LEVEL_LABELS[calcLevel(assessment.dimensions)] || '未知'}</div>
        ${assessment.suggestions && assessment.suggestions.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong>发展建议：</strong>
            <ul class="suggestion-list">
              ${assessment.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
    <p>评估系统：DOO多智能体系统 | D博士·小欧老师·多多 协同评估</p>
    <p>参考标准：《学前儿童语言学习量表》</p>
  </div>
</body>
</html>
    `;
  };

  const handleExportPDF = () => {
    if (!selectedChild) return;
    const html = generatePortraitHTML(selectedChild);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.document.title = `DOO画像报告_${selectedChild.name || '未命名'}`;
        const style = printWindow.document.createElement('style');
        style.textContent = `
          @media print {
            @page { size: A4; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `;
        printWindow.document.head.appendChild(style);
        printWindow.print();
        printWindow.close();
      }, 800);
    }
  };

  const handlePrint = () => {
    if (!selectedChild) return;
    const html = generatePortraitHTML(selectedChild);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="portrait-page animate-fade-in-up">
      <header className="page-header">
        <h1 className="brand-font gradient-text">幼儿画像</h1>
        <p>查看每位幼儿的叙事能力发展画像与雷达图</p>
      </header>

      <div className="portrait-layout">
        {/* Children List */}
        <PortraitList
          portraits={filteredPortraits}
          loading={loading}
          selectedChildId={selectedChild?.childId || null}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelect={setSelectedChild}
          onDelete={handleDelete}
          canDelete={canDelete}
          deleting={deleting}
        />

        {/* Portrait Detail */}
        {selectedChild ? (
          <PortraitDetail
            portrait={selectedChild}
            classNameMap={CLASS_NAME_MAP}
            scenarioMap={SCENARIO_MAP}
            onExport={handleExportPDF}
            onPrint={handlePrint}
          />
        ) : (
          <div className="portrait-placeholder">
            <span className="placeholder-icon">👶</span>
            <p>{portraits.length > 0 ? '选择左侧幼儿查看详细画像' : '暂无幼儿画像数据'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortraitPage;