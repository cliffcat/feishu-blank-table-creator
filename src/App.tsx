import React, { useState } from 'react';
import { bitable } from '@lark-base-open/js-sdk';

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

function App() {
  const [tableCount, setTableCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [inputError, setInputError] = useState<string>('');

  // 验证输入
  const validateInput = (value: number): string => {
    if (!value || value < 1) {
      return '请输入大于0的数字';
    }
    if (value > 100) {
      return '一次最多创建100个表格';
    }
    if (!Number.isInteger(value)) {
      return '请输入整数';
    }
    return '';
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTableCount(value);
    const error = validateInput(value);
    setInputError(error);
    if (statusMessage) {
      setStatusMessage(null);
    }
  };

  // 获取现有表格名称
  const getExistingTableNames = async (): Promise<Set<string>> => {
    try {
      const tableList = await bitable.base.getTableMetaList();
      const names = new Set<string>();
      
      for (const tableMeta of tableList) {
        names.add(tableMeta.name);
      }
      
      return names;
    } catch (error) {
      console.error('获取表格名称失败:', error);
      throw new Error('获取现有表格名称失败');
    }
  };

  // 生成唯一的表格名称
  const generateUniqueTableNames = (count: number, existingNames: Set<string>): string[] => {
    const names: string[] = [];
    let index = 1;
    
    while (names.length < count) {
      const candidateName = `空白表${index}`;
      if (!existingNames.has(candidateName)) {
        names.push(candidateName);
      }
      index++;
    }
    
    return names;
  };

  // 创建单个表格
  const createSingleTable = async (name: string): Promise<boolean> => {
    try {
      await bitable.base.addTable({ 
        name,
        fields: [
          {
            name: '字段1',
            type: 1 // 文本字段
          }
        ]
      });
      return true;
    } catch (error) {
      console.error(`创建表格 "${name}" 失败:`, error);
      return false;
    }
  };

  // 批量创建表格
  const createTables = async () => {
    if (inputError || tableCount < 1) {
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', message: '正在创建表格...' });

    try {
      // 获取现有表格名称
      const existingNames = await getExistingTableNames();
      
      // 生成唯一名称
      const tableNames = generateUniqueTableNames(tableCount, existingNames);
      
      // 批量创建表格
      const results = await Promise.allSettled(
        tableNames.map(name => createSingleTable(name))
      );
      
      // 统计结果
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;
      
      const failedCount = tableCount - successCount;
      
      if (successCount === tableCount) {
        setStatusMessage({
          type: 'success',
          message: `成功创建 ${successCount} 个表格`
        });
      } else if (successCount > 0) {
        setStatusMessage({
          type: 'error',
          message: `成功创建 ${successCount} 个表格，${failedCount} 个创建失败`
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: '所有表格创建失败，请检查权限或重试'
        });
      }
      
    } catch (error) {
      console.error('批量创建表格失败:', error);
      setStatusMessage({
        type: 'error',
        message: error instanceof Error ? error.message : '创建表格时发生未知错误'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>
        批量创建空白表
      </h2>
      
      <div className="form-group">
        <label className="form-label" htmlFor="tableCount">
          创建表格数量
        </label>
        <input
          id="tableCount"
          type="number"
          min="1"
          max="100"
          value={tableCount || ''}
          onChange={handleInputChange}
          className={`form-input ${inputError ? 'error' : ''}`}
          placeholder="请输入要创建的表格数量"
          disabled={isLoading}
        />
        {inputError && (
          <div className="error-message">{inputError}</div>
        )}
      </div>
      
      <button
        className="btn btn-primary"
        onClick={createTables}
        disabled={isLoading || !!inputError || tableCount < 1}
        style={{ width: '100%' }}
      >
        {isLoading && <div className="loading-spinner" />}
        {isLoading ? '创建中...' : '创建表格'}
      </button>
      
      {statusMessage && (
        <div className={`status-message status-${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#8f959e' }}>
        <p>• 表格将按照"空白表1"、"空白表2"的格式命名</p>
        <p>• 如遇重名会自动跳过序号</p>
        <p>• 每个表格默认包含一行一列</p>
      </div>
    </div>
  );
}

export default App;