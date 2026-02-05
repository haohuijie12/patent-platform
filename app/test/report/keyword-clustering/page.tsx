'use client';

import { useState } from 'react';

interface Cluster {
  id: number;
  name: string;
  keywords: string[];
}

export default function KeywordClusteringTestPage() {
  const [keywords, setKeywords] = useState('');
  const [clusterCount, setClusterCount] = useState(3);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClustering = async () => {
    if (!keywords.trim()) {
      setError('请输入关键词');
      return;
    }

    const keywordList = keywords.split(/[，、,\n]/).map(k => k.trim()).filter(k => k);

    if (keywordList.length === 0) {
      setError('请输入有效的关键词');
      return;
    }

    if (keywordList.length < 2) {
      setError('请至少输入2个关键词');
      return;
    }

    setLoading(true);
    setError('');
    setClusters([]);

    try {
      const response = await fetch(
        `/api/report/keyword-clustering?keywords=${encodeURIComponent(keywords)}&count=${clusterCount}`
      );

      const data = await response.json();

      if (data.success) {
        setClusters(data.data.clusters);
      } else {
        setError(data.error || '聚类失败');
      }
    } catch (err) {
      console.error('请求出错:', err);
      setError('网络或服务器错误');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setKeywords('');
    setClusters([]);
    setError('');
  };

  return (
    <div className="p-5 flex gap-7 h-[calc(100vh-120px)]">
      <div className="flex-1 max-w-[400px] flex flex-col">
        <h2 className="mb-5">关键词聚类设置</h2>
        
        <div className="my-5 flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 font-medium">关键词列表 *</label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="例如：&#10;机器学习&#10;深度学习&#10;神经网络&#10;GPU&#10;芯片&#10;算法"
              className="w-full p-2.5 border border-gray-200 rounded h-40 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              支持用顿号、逗号或换行分隔
            </p>
          </div>

          <div>
            <label className="block mb-1.5 font-medium">期望聚类数量</label>
            <input
              type="number"
              min="2"
              max="10"
              value={clusterCount}
              onChange={(e) => setClusterCount(Number(e.target.value))}
              className="w-[100px] p-2.5 border border-gray-200 rounded"
            />
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleClustering}
              disabled={loading}
              className={`flex-1 p-3 font-medium text-white rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
            >
              {loading ? '聚类中...' : '开始聚类'}
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-md font-medium cursor-pointer"
            >
              清空
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 my-2.5 p-2.5 bg-red-50 rounded">
            错误：{error}
          </div>
        )}

        <div className="mt-5 p-3.5 bg-gray-100 rounded">
          <h4 className="mb-2.5">使用提示</h4>
          <ul className="text-sm leading-relaxed">
            <li>输入多个关键词后，系统会基于LLM技术进行智能聚类</li>
            <li>关键词可以用顿号、逗号或换行分隔</li>
            <li>聚类结果可用于专利检索、技术分析或专利申请文件撰写</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 min-w-[400px] border-l border-gray-200 pl-7">
        <h2 className="mb-5">聚类结果</h2>
        
        <div className="mb-7">
          <h3 className="mb-3.5 text-base font-medium">
            生成的聚类（共 {clusters.length} 组）
          </h3>
          {clusters.length > 0 ? (
            <div className="space-y-4">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="p-4 bg-gray-50 rounded">
                  <h4 className="mb-2.5 font-medium text-blue-600">
                    {cluster.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cluster.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-7 bg-gray-50 rounded text-center">
              <p>暂无聚类结果，请点击左侧"开始聚类"按钮。</p>
            </div>
          )}
        </div>

        {clusters.length > 0 && (
          <div>
            <h3 className="mb-2.5 text-base font-medium">复制结果</h3>
            <div className="space-y-2.5">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="flex gap-2.5">
                  <input
                    type="text"
                    value={`${cluster.name}：${cluster.keywords.join('、')}`}
                    readOnly
                    className="flex-1 p-2.5 border border-gray-200 rounded text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${cluster.name}：${cluster.keywords.join('、')}`)}
                    className="px-3.5 py-2.5 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-sm"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
