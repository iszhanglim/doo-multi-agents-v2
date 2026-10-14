import React, { useState, useEffect, useRef } from 'react';
import { useAssessment } from '../hooks/useAssessment';
import { useConversation } from '../hooks/useConversation';
import { useAuth } from '../context/AuthContext';
import RadarChart from '../components/RadarChart';
import ReportExport from '../components/ReportExport';
import StarRating from '../components/StarRating';
import VoiceInput from '../components/VoiceInput';
import VoiceOutput from '../components/VoiceOutput';
import type { DOOAssessment } from '../types';
import { useClasses } from '../hooks/useClasses';
import { useScenarios } from '../hooks/useScenarios';

const AssessPage: React.FC = () => {
  const { user } = useAuth();
  const { assessment, interactions, reflections, report, loading, error, assess, clearAssessment } = useAssessment();
  const conv = useConversation();
  const { classes } = useClasses();
  const { scenarios } = useScenarios();
  const [mode, setMode] = useState<'assess' | 'conversation'>('assess');
  const [childName, setChildName] = useState('');
  const [content, setContent] = useState('');
  const [scenario, setScenario] = useState('smart_story_corner');
  const [classId, setClassId] = useState('class_001');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user?.role === 'teacher' && user?.classId) setClassId(user.classId); }, [user]);
  useEffect(() => {
    if (classes.length > 0 && !user?.classId && !classes.some((c) => c.id === classId)) setClassId(classes[0].id);
  }, [classes, user?.classId, classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !content.trim()) return;
    await assess({ childName: childName.trim(), classId, content: content.trim(), scenario, timestamp: new Date() });
  };

  const handleConvStart = async () => { if (!childName.trim()) return; await conv.start(childName.trim(), classId, scenario); };
  const handleChatSend = async () => {
    if (!chatInput.trim() || conv.loading) return;
    const msg = chatInput.trim(); setChatInput('');
    await conv.send(msg);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const currentScenario = scenarios.find((s) => s.id === scenario) || scenarios[0]
    || { id: scenario, label: '当前场景', description: '' };

  const classLabel = (id: string) => classes.find((c) => c.id === id)?.name || id;

  return (
    <div className="assess-page animate-fade-in-up">
      <header className="page-header">
        <h1 className="brand-font gradient-text">叙事能力评估</h1>
        <p>D博士、小欧老师和多多将协同完成评估、支架与互动反馈</p>
      </header>

      <div className="mode-toggle">
        <button className={`mode-tab ${mode === 'assess' ? 'active' : ''}`} onClick={() => setMode('assess')}>📝 评估模式</button>
        <button className={`mode-tab ${mode === 'conversation' ? 'active' : ''}`} onClick={() => setMode('conversation')}>💬 对话模式</button>
      </div>

      {mode === 'conversation' && (
        <div className="conv-layout">
          <div className="conv-sidebar">
            <div className="assess-form">
              <div className="form-group"><label>幼儿姓名</label><input type="text" className="input-field" placeholder="请输入幼儿姓名" value={childName} onChange={(e) => setChildName(e.target.value)} /></div>
              <div className="form-group"><label>所属班级</label>
                {user?.role === 'teacher' && user?.classId ? <input type="text" className="input-field" value={classLabel(user.classId)} disabled readOnly />
                  : <select className="input-field" value={classId} onChange={(e) => setClassId(e.target.value)}>{classes.length > 0 ? classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option value="">加载班级...</option>}</select>}
              </div>
              <div className="form-group"><label>评估场景</label>
                <select className="input-field" value={scenario} onChange={(e) => setScenario(e.target.value)}>{scenarios.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
              </div>
              {conv.status === 'idle' ? <button className="btn-primary" onClick={handleConvStart} disabled={!childName.trim() || conv.loading}>{conv.loading ? '⏳ 创建中...' : '🚀 开始对话'}</button>
                : <button className="btn-secondary" onClick={conv.reset}>🔄 重新开始</button>}
              {conv.status === 'chatting' && <div className="conv-progress"><span>第 {conv.turnCount} / {conv.maxTurns} 轮</span><button className="btn-end" onClick={conv.end} disabled={conv.loading}>{conv.loading ? '评估中...' : '📊 结束并评估'}</button></div>}
            </div>
            <div className="scenario-hint"><span className="scenario-hint-label">当前场景</span><span className="scenario-hint-text">{currentScenario.label}</span><span className="scenario-hint-desc">{currentScenario.description}</span></div>
          </div>
          <div className="conv-chat-area">
            {conv.status === 'idle' && <div className="conv-empty"><div className="conv-empty-icon">💬</div><p>输入幼儿姓名，选择场景，点击"开始对话"</p><p className="conv-empty-hint">多多会和孩子进行多轮对话，最后汇总评估</p></div>}
            {(conv.status === 'chatting' || conv.status === 'assessing') && (
              <div className="conv-chat">
                <div className="chat-header"><span>🧒 {childName || '小朋友'} 与 {conv.agentName === '小欧老师' ? '👩‍🏫 小欧老师' : '🤖 多多'}的对话</span><span className="chat-round">第 {conv.turnCount} 轮</span></div>
                <div className="chat-messages">
                  {conv.messages.map(msg => (<div key={msg.id} className={`chat-bubble ${msg.role === 'child' ? 'child-bubble' : 'peer-bubble'}`}><div className="bubble-avatar">{msg.role === 'child' ? '🧒' : conv.agentName === '小欧老师' ? '👩‍🏫' : '🤖'}</div><div className="bubble-content">{msg.content}{msg.role === 'peer' && <VoiceOutput text={msg.content} />}</div></div>))}
                  {conv.loading && <div className="chat-bubble peer-bubble"><div className="bubble-avatar">{conv.agentName === '小欧老师' ? '👩‍🏫' : '🤖'}</div><div className="bubble-content typing">{conv.agentName === '小欧老师' ? '小欧老师正在思考...' : '多多正在思考...'}</div></div>}<div ref={chatEndRef} />
                </div>
                {conv.status === 'chatting' && (
                  <div className="chat-input-area">
                    <div className="chat-input-row"><input type="text" className="chat-input" placeholder="输入孩子的回答..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} disabled={conv.loading} /><button className="chat-send-btn" onClick={handleChatSend} disabled={!chatInput.trim() || conv.loading}>发送</button></div>
                    <div className="chat-voice-row"><VoiceInput onTranscript={(text) => setChatInput(prev => prev ? prev + text : text)} /></div>
                  </div>)}
                {conv.status === 'assessing' && <div className="chat-assessing"><span className="spinner" /> 三智能体正在协同评估中...</div>}
              </div>)}
            {conv.status === 'done' && conv.assessment && <div className="conv-result"><ResultView childName={childName} assessment={conv.assessment} suggestions={conv.assessment.suggestions || []} interactions={conv.interactions || []} reflections={conv.reflections || []} messages={conv.messages} agentName={conv.agentName} /></div>}
          </div>
        </div>
      )}

      {mode === 'assess' && (
        <div className="assess-layout">
          <div className="assess-form-container">
            <form onSubmit={handleSubmit} className="assess-form">
              <div className="form-group"><label>幼儿姓名</label><input type="text" className="input-field" placeholder="请输入幼儿姓名" value={childName} onChange={(e) => setChildName(e.target.value)} required /></div>
              <div className="form-group"><label>所属班级</label>
                {user?.role === 'teacher' && user?.classId ? <input type="text" className="input-field" value={classLabel(user.classId)} disabled readOnly />
                  : <select className="input-field" value={classId} onChange={(e) => setClassId(e.target.value)}>{classes.length > 0 ? classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option value="">加载班级...</option>}</select>}
              </div>
              <div className="form-group"><label>评估场景</label><select className="input-field" value={scenario} onChange={(e) => setScenario(e.target.value)}>{scenarios.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
              <div className="form-group">
                <label>叙事内容 <VoiceInput onTranscript={(text) => setContent(prev => { const t = prev.trim(); if (!t) return text; return t + (/[。！？，、；：]$/.test(t.slice(-1)) ? '' : '。') + text; })} /></label>
                <textarea className="input-field" rows={6} placeholder="请记录幼儿的叙事内容..." value={content} onChange={(e) => setContent(e.target.value)} required />
                <span className="char-count">{content.length} 字</span>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? <><span className="spinner" /> 评估中...</> : <>🎯 开始评估</>}</button>
                {assessment && <button type="button" className="btn-secondary" onClick={clearAssessment}>重新评估</button>}
              </div>
            </form>
            {error && <div className="error-message">❌ {error}</div>}
          </div>
          {assessment && assessment.dimensions && <div className="assess-results"><ResultView childName={childName} assessment={assessment} suggestions={assessment.suggestions || []} interactions={interactions} reflections={reflections} messages={[]} agentName="多多" report={report} /></div>}
        </div>
      )}
    </div>
  );
};

function ResultView({ childName, assessment, suggestions, interactions, reflections, messages, agentName, report }: {
  childName: string; assessment: DOOAssessment; suggestions: string[];
  interactions: any[]; reflections: string[]; messages: any[]; agentName?: string; report?: string;
}) {
  const gc = (l: number) => l < 3 ? '#FF6B6B' : l < 4 ? '#FFB347' : '#4ADE80';
  const cl = (d: DOOAssessment['dimensions']) => {
    const scores = [
      d.diction.vocabulary, d.diction.sentenceStructure,
      d.organization.narrativeStructure, d.organization.timeMarker,
      d.organization.themeRelevance, d.organization.eventExpansion,
      d.organization.expressiveness, d.opinion.narrativeViewpoint,
    ];
    const avg = scores.reduce((s, v) => s + v, 0) / 8;
    return Math.max(1, Math.min(5, Math.round(avg)));
  };
  const level = cl(assessment.dimensions);

  // 提取小欧老师数据
  const teacherMsgs = interactions.filter((m: any) => m.type === 'suggestion' && m.from === 'teacher');
  const teacherNotes = teacherMsgs.flatMap((m: any) => m.payload?.teachingNotes || []);
  const scaffoldItems = teacherMsgs.flatMap((m: any) => m.payload?.scaffoldSuggestions || []);
  const peerMsgs = interactions.filter((m: any) => m.from === 'peer').map((m: any) => m.payload?.message).filter(Boolean);

  return (<>
    <div className="result-card overall">
      <div className="overall-header"><h2>评估结果</h2><div className="level-badge" style={{ background: `${gc(level)}20`, color: gc(level) }}>
        <StarRating score={level} />
      </div></div>
      <div className="radar-section"><RadarChart data={{ diction: ((assessment.dimensions.diction?.vocabulary || 0) + (assessment.dimensions.diction?.sentenceStructure || 0)) / 2, organization: ((assessment.dimensions.organization?.narrativeStructure || 0) + (assessment.dimensions.organization?.timeMarker || 0) + (assessment.dimensions.organization?.themeRelevance || 0) + (assessment.dimensions.organization?.eventExpansion || 0) + (assessment.dimensions.organization?.expressiveness || 0)) / 5, opinion: assessment.dimensions.opinion?.narrativeViewpoint || 0 }} /></div>
    </div>

    <div className="result-card dimensions"><h3>详细维度分析</h3>
      {[['📝','词句维度',[['词汇丰富度',assessment.dimensions.diction?.vocabulary,'#FF8C42'],['句型复杂度',assessment.dimensions.diction?.sentenceStructure,'#FF8C42']]],['🧩','组织维度',[['叙事结构',assessment.dimensions.organization?.narrativeStructure,'#6B5B95'],['时间标记',assessment.dimensions.organization?.timeMarker,'#6B5B95'],['主题关联',assessment.dimensions.organization?.themeRelevance,'#6B5B95'],['事件扩展',assessment.dimensions.organization?.eventExpansion,'#6B5B95'],['表现力',assessment.dimensions.organization?.expressiveness,'#6B5B95']]],['💭','观点维度',[['叙事观点',assessment.dimensions.opinion?.narrativeViewpoint,'#88D8B0']]]].map(([icon,name,bars]) => (
        <div key={name as string} className="dimension-group"><div className="dimension-header"><span className="dimension-icon">{icon as string}</span><span className="dimension-name">{name as string}</span></div>
          <div className="dimension-bars">{(bars as any[]).map(([l,v,c]: [string,number,string]) => (<div key={l} className="dim-bar"><span>{l}</span><div className="bar-track"><div className="bar-fill" style={{width:`${((v||0)/5)*100}%`,background:c}}/></div><span className="bar-value">{v||0}分</span></div>))}</div></div>))}
    </div>

    {suggestions.length > 0 && <div className="result-card"><h3>💡 发展建议</h3><ul style={{margin:0,paddingLeft:18}}>{suggestions.map((s,i) => <li key={i} style={{color:'var(--text-secondary)',lineHeight:1.7,marginBottom:4}}>{s}</li>)}</ul></div>}

    {/* 多智能体协同反馈 */}
    {(teacherNotes.length > 0 || scaffoldItems.length > 0 || peerMsgs.length > 0) && (
      <div className="result-card"><h3>🤝 多智能体协同反馈</h3>
        <div className="collaboration-grid">
          <div className="collaboration-panel teacher-panel">
            <h4>👩‍🏫 小欧老师</h4>
            {teacherNotes.length > 0 ? (
              <div>
                <div className="teacher-report-section"><h5>📋 本次观察结果</h5><p>{teacherNotes[0]}</p></div>
                {teacherNotes[1] && <div className="teacher-report-section"><h5>💡 整体建议</h5><p className="teacher-advice">{teacherNotes[1]}</p></div>}
                {teacherNotes[2] && <div className="teacher-report-section"><h5>🔜 下次活动提示</h5><p className="activity-case">{teacherNotes[2]}</p></div>}
                {scaffoldItems.length > 0 && (
                  <div className="teacher-report-section">
                    <h5>📌 DOO支架建议</h5>
                    <ul className="teacher-scaffold-list">{scaffoldItems.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
              </div>
            ) : <p className="empty-collab">暂无数据</p>}
          </div>
          <div className="collaboration-panel peer-panel">
            <h4>🧒 多多同伴回应</h4>
            {peerMsgs.length > 0 ? <div>{peerMsgs.map((msg: string, i: number) => <div key={i} className="peer-message-card"><p>{msg}</p></div>)}</div> : <p className="empty-collab">暂未生成。</p>}
          </div>
        </div>
      </div>
    )}

    {reflections.length > 0 && <div className="result-card"><h3>🔁 反思优化</h3><ul style={{margin:0,paddingLeft:18}}>{reflections.map((r,i) => <li key={i} style={{color:'var(--text-secondary)',lineHeight:1.7,marginBottom:4}}>{r}</li>)}</ul></div>}

    {messages.length > 0 && (
      <div className="result-card"><h3>📝 完整对话记录</h3><div className="chat-messages" style={{maxHeight:'none'}}>
        {messages.map((msg: any) => (<div key={msg.id} className={`chat-bubble ${msg.role === 'child' ? 'child-bubble' : 'peer-bubble'}`}><div className="bubble-avatar">{msg.role === 'child' ? '🧒' : agentName === '小欧老师' ? '👩‍🏫' : '🤖'}</div><div className="bubble-content">{msg.content}{msg.role === 'peer' && <VoiceOutput text={msg.content} autoPlay={false} />}</div></div>))}
      </div></div>
    )}

    {report && (
      <div className="result-card db-report">
        <h3>🔬 D博士个体评估报告</h3>
        <pre className="db-report-text">{report}</pre>
      </div>
    )}

    <ReportExport childName={childName} assessment={assessment} />
  </>);
}

export default AssessPage;
