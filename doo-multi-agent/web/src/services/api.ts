import type { ChildPortrait, NarrativeInput, AssessmentRunResult } from '../types';

// 前端与后端同源部署（express 服务静态产物 + /api 接口均在 5000 端口），统一使用相对路径。
// 不硬编码域名 / IP / 端口，避免与部署端口或本机地址耦合。
const API_BASE = '/api';

/** 登录令牌（服务端 HMAC 签名），管理类接口靠它做角色校验 */
const TOKEN_KEY = 'doo_token';

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Auth-Token': token } : {}),
      // 允许调用方额外覆盖/追加头
      ...((options?.headers as Record<string, string> | undefined) ?? {}),
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  // 健康检查
  health: () => fetchApi<{ status: string; agents: string[] }>('/health'),

  // 评估叙事
  assess: (input: NarrativeInput) =>
    fetchApi<AssessmentRunResult>('/assess', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // 运行场景
  runScenario: (type: string, input: NarrativeInput) =>
    fetchApi<{ success: boolean; result: unknown }>(`/scenario/${type}`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // 获取幼儿画像
  getPortrait: (childId: string) =>
    fetchApi<{ success: boolean; portrait: ChildPortrait }>(`/portrait/${childId}`),

  // 获取所有画像（带班级过滤；admin 不传看全部）
  getPortraits: (classId?: string) =>
    fetchApi<{ success: boolean; portraits: ChildPortrait[] }>(
      classId ? `/portraits?classId=${encodeURIComponent(classId)}` : '/portraits',
    ),

  // 生成雷达图
  getRadar: (childId: string) =>
    fetchApi<{ success: boolean; radar: string }>(`/radar/${childId}`),

  // 生成报告
  getReport: (childId: string) =>
    fetchApi<{ success: boolean; report: string }>(`/report/${childId}`),

  // 获取统计数据（带班级过滤；admin 不传看全部）
  getStats: (classId?: string) =>
    fetchApi<{ success: boolean; stats: { totalChildren: number; todayCount: number; classCount: number; avgLevel: number } }>(
      classId ? `/stats?classId=${encodeURIComponent(classId)}` : '/stats',
    ),

  // 删除幼儿画像
  deletePortrait: (childId: string) =>
    fetchApi<{ success: boolean; message: string }>(`/portrait/${childId}`, {
      method: 'DELETE',
    }),

  // ========== 多轮对话 API ==========

  // 开始对话
  conversationStart: (data: { childName: string; classId?: string; scenario?: string }) =>
    fetchApi<{ success: boolean; sessionId: string; greeting: string; agentName?: string; maxTurns: number }>('/conversation/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 对话轮次
  conversationTurn: (data: { sessionId: string; message: string }) =>
    fetchApi<{ success: boolean; peerMessage: string; agentName?: string; turnCount: number; maxTurns: number; suggestEnd: boolean }>('/conversation/turn', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 结束对话
  conversationEnd: (data: { sessionId: string }) =>
    fetchApi<{ success: boolean; turns: unknown[]; childNarrative: string; assessment: AssessmentRunResult['assessment']; portrait: AssessmentRunResult['portrait']; interactions: AssessmentRunResult['interactions']; reflections: string[] }>('/conversation/end', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ========== 班级管理 API ==========
  getClasses: () => fetchApi<{ success: boolean; classes: Array<{ id: string; name: string }> }>('/classes'),
  createClass: (data: { id: string; name: string }) =>
    fetchApi<{ success: boolean }>('/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id: string, name: string) =>
    fetchApi<{ success: boolean }>(`/classes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteClass: (id: string) =>
    fetchApi<{ success: boolean }>(`/classes/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // ========== 场景库 API ==========
  getScenarios: () =>
    fetchApi<{ success: boolean; scenarios: Array<{ id: string; label: string; description: string; enabled: boolean }> }>('/scenarios'),
  createScenario: (data: { id: string; label: string; description?: string }) =>
    fetchApi<{ success: boolean }>('/scenarios', { method: 'POST', body: JSON.stringify(data) }),
  updateScenario: (id: string, data: { label?: string; description?: string; enabled?: boolean }) =>
    fetchApi<{ success: boolean }>(`/scenarios/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteScenario: (id: string) =>
    fetchApi<{ success: boolean }>(`/scenarios/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
