// app/test/report/keyword-recommendation/page.tsx
'use client'; // 因为是交互页面，需要标记为客户端组件

import { useState } from 'react';

export default function KeywordRecommendationTestPage() {
  // 状态管理：输入参数和结果
  const [coreKeyword, setCoreKeyword] = useState('');
  const [technicalField, setTechnicalField] = useState('通用技术');
  const [desiredCount, setDesiredCount] = useState(5);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 调用您编写的后端API
  const handleRecommend = async () => {
    if (!coreKeyword.trim()) {
      setError('请输入核心关键词');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      // 调用 GET 接口，您也可以改用 POST
      const response = await fetch(
        `/api/report/keyword-recommendation?keyword=${encodeURIComponent(coreKeyword)}&field=${technicalField}&count=${desiredCount}`
      );

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data.recommendations);
      } else {
        setError(data.error || '推荐失败');
      }
    } catch (err) {
      console.error('请求出错:', err);
      setError('网络或服务器错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 flex gap-7 h-[calc(100vh-120px)]">
      {/* 左侧输入区域 */}
      <div className="flex-1 max-w-[400px] flex flex-col">
        <h2 className="mb-5">关键词推荐设置</h2>
        
        <div className="my-5 flex flex-col gap-4">
          {/* 核心关键词输入 */}
          <div>
            <label className="block mb-1.5 font-medium">核心关键词 *</label>
            <input
              type="text"
              value={coreKeyword}
              onChange={(e) => setCoreKeyword(e.target.value)}
              placeholder="例如：智能座舱"
              className="w-full p-2.5 border border-gray-200 rounded"
            />
          </div>

          {/* 技术领域输入 */}
          <div>
            <label className="block mb-1.5 font-medium">技术领域</label>
            <input
              type="text"
              value={technicalField}
              onChange={(e) => setTechnicalField(e.target.value)}
              placeholder="例如：汽车电子"
              className="w-full p-2.5 border border-gray-200 rounded"
            />
          </div>

          {/* 期望数量输入 */}
          <div>
            <label className="block mb-1.5 font-medium">期望推荐数量</label>
            <input
              type="number"
              min="1"
              max="20"
              value={desiredCount}
              onChange={(e) => setDesiredCount(Number(e.target.value))}
              className="w-[100px] p-2.5 border border-gray-200 rounded"
            />
          </div>

          {/* 触发按钮 */}
          <button
            onClick={handleRecommend}
            disabled={loading}
            className={`p-3 w-full font-medium text-white rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
          >
            {loading ? '推荐中...' : '开始推荐'}
          </button>
        </div>

        {/* 错误信息显示 */}
        {error && (
          <div className="text-red-500 my-2.5 p-2.5 bg-red-50 rounded">
            错误：{error}
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-5 p-3.5 bg-gray-100 rounded">
          <h4 className="mb-2.5">使用提示</h4>
          <ul className="text-sm leading-relaxed">
            <li>输入核心关键词后，系统会基于LLM技术生成相关的扩展关联词</li>
            <li>选择合适的技术领域可以提高推荐结果的相关性</li>
            <li>推荐的关联词可用于专利检索、技术分析或专利申请文件撰写</li>
          </ul>
        </div>
      </div>

      {/* 右侧输出区域 */}
      <div className="flex-1 min-w-[400px] border-l border-gray-200 pl-7">
        <h2 className="mb-5">推荐结果</h2>
        
        {/* 结果展示区域 */}
        <div className="mb-7">
          <h3 className="mb-3.5 text-base font-medium">生成的关联词（共 {recommendations.length} 个）</h3>
          {recommendations.length > 0 ? (
            <div className="p-3.5 bg-gray-50 rounded max-h-[400px] overflow-y-auto">
              {recommendations.map((word, index) => (
                <div key={index} className="p-2 border-b border-gray-200 text-sm">
                  {word}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-7 bg-gray-50 rounded text-center">
              <p>暂无推荐结果，请点击左侧“开始推荐”按钮。</p>
            </div>
          )}
        </div>

        {/* 复制结果区域 */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="mb-2.5 text-base font-medium">推荐结果（可直接复制）</h3>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={recommendations.join('、')}
                readOnly
                className="flex-1 p-2.5 border border-gray-200 rounded"
              />
              <button
                onClick={() => navigator.clipboard.writeText(recommendations.join('、'))}
                className="px-3.5 py-2.5 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
              >
                复制
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}