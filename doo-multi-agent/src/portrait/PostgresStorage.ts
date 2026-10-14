import { ChildPortrait, ClassPortraitGroup } from '../core/types';
import { IPortraitStorage } from './IPortraitStorage';
import { Pool } from 'pg';

export class PostgresStorage implements IPortraitStorage {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl });
  }

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS portraits (
        child_id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        class_id VARCHAR(128) NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_portraits_class ON portraits(class_id);

      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(64) PRIMARY KEY,
        password_hash VARCHAR(128) NOT NULL,
        name VARCHAR(64) NOT NULL,
        role VARCHAR(16) NOT NULL DEFAULT 'teacher',
        class_id VARCHAR(64),
        avatar VARCHAR(16) DEFAULT '👩‍🏫',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS classes (
        class_id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_classes_sort ON classes(sort_order);

      CREATE TABLE IF NOT EXISTS scenarios (
        scenario_id VARCHAR(64) PRIMARY KEY,
        label VARCHAR(64) NOT NULL,
        description VARCHAR(255) NOT NULL DEFAULT '',
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_scenarios_sort ON scenarios(sort_order);
    `);
    console.log('✅ PostgreSQL 数据表初始化完成');
  }

  // ========== 班级管理 ==========

  async listClasses(): Promise<Array<{ class_id: string; name: string; sort_order: number }>> {
    const result = await this.pool.query('SELECT class_id, name, sort_order FROM classes ORDER BY sort_order, class_id');
    return result.rows;
  }

  async getClass(classId: string): Promise<{ class_id: string; name: string } | null> {
    const result = await this.pool.query('SELECT class_id, name FROM classes WHERE class_id = $1', [classId]);
    return result.rows[0] || null;
  }

  async createClass(classId: string, name: string, sortOrder = 0): Promise<boolean> {
    try {
      await this.pool.query(
        'INSERT INTO classes (class_id, name, sort_order) VALUES ($1, $2, $3)',
        [classId, name, sortOrder]
      );
      return true;
    } catch (error) {
      console.error(`创建班级失败（classId=${classId}）:`, error instanceof Error ? error.message : error);
      return false;
    }
  }

  async updateClass(classId: string, updates: { name?: string; sort_order?: number }): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) continue;
      if (key !== 'name' && key !== 'sort_order') continue;
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
    if (fields.length === 0) return false;
    values.push(classId);
    const result = await this.pool.query(`UPDATE classes SET ${fields.join(', ')} WHERE class_id = $${idx}`, values);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteClass(classId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM classes WHERE class_id = $1', [classId]);
    return (result.rowCount ?? 0) > 0;
  }

  async seedDefaultClasses(): Promise<void> {
    const existing = await this.listClasses();
    if (existing.length >= 4) return;
    const defaults: Array<[string, string]> = [
      ['class_001', '大班一班'],
      ['class_002', '大班二班'],
      ['class_003', '大班三班'],
      ['class_004', '大班四班'],
    ];
    for (const [id, name] of defaults) {
      const found = await this.getClass(id);
      if (!found) await this.createClass(id, name, Number(id.slice(-1)));
    }
    console.log('👥 已确保默认班级存在');
  }

  // ========== 场景库管理 ==========

  async listScenarios(): Promise<Array<{ scenario_id: string; label: string; description: string; enabled: boolean; sort_order: number }>> {
    const result = await this.pool.query('SELECT scenario_id, label, description, enabled, sort_order FROM scenarios ORDER BY sort_order, scenario_id');
    return result.rows;
  }

  async getScenario(scenarioId: string): Promise<{ scenario_id: string; label: string; enabled: boolean } | null> {
    const result = await this.pool.query('SELECT scenario_id, label, enabled FROM scenarios WHERE scenario_id = $1', [scenarioId]);
    return result.rows[0] || null;
  }

  async createScenario(scenario: { scenario_id: string; label: string; description: string; enabled?: boolean; sort_order?: number }): Promise<boolean> {
    try {
      await this.pool.query(
        'INSERT INTO scenarios (scenario_id, label, description, enabled, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [scenario.scenario_id, scenario.label, scenario.description, scenario.enabled ?? true, scenario.sort_order ?? 0]
      );
      return true;
    } catch (error) {
      console.error(`创建场景失败（scenario=${scenario.scenario_id}）:`, error instanceof Error ? error.message : error);
      return false;
    }
  }

  async updateScenario(scenarioId: string, updates: { label?: string; description?: string; enabled?: boolean; sort_order?: number }): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) continue;
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
    if (fields.length === 0) return false;
    values.push(scenarioId);
    const result = await this.pool.query(`UPDATE scenarios SET ${fields.join(', ')} WHERE scenario_id = $${idx}`, values);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteScenario(scenarioId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM scenarios WHERE scenario_id = $1', [scenarioId]);
    return (result.rowCount ?? 0) > 0;
  }

  async seedDefaultScenarios(): Promise<void> {
    const existing = await this.listScenarios();
    if (existing.length >= 3) return;
    const defaults: Array<[string, string, string]> = [
      ['smart_story_corner', '智能故事角', '幼儿自主选择绘本讲述，多多陪伴互动'],
      ['narrative_train', '叙事火车', '师幼集体叙事游戏，多多接力讲故事'],
      ['journey_podcast', '西游播客', '亲子家庭叙事活动，多多倾听陪伴'],
      ['morning_check_in', '入园晨检', '入园环节记录幼儿晨间表达与描述'],
      ['area_activity', '区域活动', '区域活动中的自发言语与同伴交流'],
      ['outdoor_sport', '户外/体育游戏', '户外体育游戏中的表达与规则讲述'],
      ['daily_life', '生活活动（进餐/午睡）', '进餐、午睡等生活环节的叙事表达'],
    ];
    for (const [id, label, desc] of defaults) {
      const found = await this.getScenario(id);
      if (!found) await this.createScenario({ scenario_id: id, label, description: desc, enabled: true });
    }
    console.log('🎭 已确保默认场景库存在');
  }

  // ========== 用户管理 ==========

  async createUser(username: string, passwordHash: string, name: string, role = 'teacher', classId?: string, avatar = '👩‍🏫'): Promise<boolean> {
    try {
      await this.pool.query(
        'INSERT INTO users (username, password_hash, name, role, class_id, avatar) VALUES ($1, $2, $3, $4, $5, $6)',
        [username, passwordHash, name, role, classId || null, avatar]
      );
      return true;
    } catch (error) {
      console.error(`创建用户失败（username=${username}）:`, error instanceof Error ? error.message : error);
      return false;
    }
  }

  async getUser(username: string): Promise<{ username: string; password_hash: string; name: string; role: string; class_id: string | null; avatar: string } | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  async listUsers(): Promise<Array<{ username: string; name: string; role: string; class_id: string | null; avatar: string }>> {
    const result = await this.pool.query('SELECT username, name, role, class_id, avatar FROM users ORDER BY created_at');
    return result.rows;
  }

  /**
   * 允许被更新的列白名单。
   * `updateUser` 会把列名拼进 SQL 语句（无法参数化标识符），因此列名绝不能来自调用方的任意键。
   */
  private static readonly UPDATABLE_USER_FIELDS = new Set(['name', 'role', 'class_id', 'avatar']);

  async updateUser(username: string, updates: { name?: string; role?: string; class_id?: string; avatar?: string }): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) continue;
      if (!PostgresStorage.UPDATABLE_USER_FIELDS.has(key)) {
        throw new Error(`不允许更新的用户字段: ${key}`);
      }
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
    if (fields.length === 0) return false;
    values.push(username);
    const result = await this.pool.query(`UPDATE users SET ${fields.join(', ')} WHERE username = $${idx}`, values);
    return (result.rowCount ?? 0) > 0;
  }

  async updatePassword(username: string, passwordHash: string): Promise<boolean> {
    const result = await this.pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [passwordHash, username]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteUser(username: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM users WHERE username = $1', [username]);
    return (result.rowCount ?? 0) > 0;
  }

  async savePortrait(portrait: ChildPortrait): Promise<void> {
    await this.pool.query(
      `INSERT INTO portraits (child_id, name, class_id, data, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (child_id) DO UPDATE SET
         name = EXCLUDED.name,
         class_id = EXCLUDED.class_id,
         data = EXCLUDED.data,
         updated_at = NOW()`,
      [portrait.childId, portrait.name, portrait.classId, JSON.stringify(portrait)]
    );
  }

  async loadPortrait(childId: string): Promise<ChildPortrait | null> {
    const result = await this.pool.query(
      'SELECT data FROM portraits WHERE child_id = $1',
      [childId]
    );
    if (result.rows.length === 0) return null;
    return this.parsePortrait(result.rows[0].data);
  }

  async deletePortrait(childId: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM portraits WHERE child_id = $1',
      [childId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async listPortraits(): Promise<string[]> {
    const result = await this.pool.query('SELECT child_id FROM portraits ORDER BY updated_at DESC');
    return result.rows.map(r => r.child_id);
  }

  async loadAllPortraits(): Promise<ChildPortrait[]> {
    const result = await this.pool.query('SELECT data FROM portraits ORDER BY updated_at DESC');
    return result.rows.map(r => this.parsePortrait(r.data)).filter(Boolean) as ChildPortrait[];
  }

  async saveClassGroup(group: ClassPortraitGroup): Promise<void> {
    // Class groups are derived from portraits, no separate storage needed
  }

  async loadClassGroup(_classId: string): Promise<ClassPortraitGroup | null> {
    return null;
  }

  async exportToJSON(): Promise<string> {
    const portraits = await this.loadAllPortraits();
    return JSON.stringify({ exportTime: new Date().toISOString(), portraitCount: portraits.length, portraits }, null, 2);
  }

  async importFromJSON(jsonData: string): Promise<number> {
    try {
      const data: unknown = JSON.parse(jsonData);
      const portraits = (data as { portraits?: unknown } | null)?.portraits;
      // 原先直接 `data.portraits as ChildPortrait[]` 纯断言，畸形数据会静默污染库
      if (!Array.isArray(portraits)) {
        console.error('导入画像失败：JSON 中缺少 portraits 数组');
        return 0;
      }
      for (const portrait of portraits as ChildPortrait[]) {
        await this.savePortrait(portrait);
      }
      return portraits.length;
    } catch (error) {
      console.error('导入画像失败:', error instanceof Error ? error.message : error);
      return 0;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private parsePortrait(data: any): ChildPortrait | null {
    try {
      const portrait = typeof data === 'string' ? JSON.parse(data) : data;
      portrait.basePortrait.createdAt = new Date(portrait.basePortrait.createdAt);
      portrait.basePortrait.updatedAt = new Date(portrait.basePortrait.updatedAt);
      for (const a of portrait.basePortrait.assessments) {
        a.timestamp = new Date(a.timestamp);
      }
      return portrait;
    } catch (error) {
      console.warn('画像数据解析失败，已跳过该条:', error instanceof Error ? error.message : error);
      return null;
    }
  }
}
