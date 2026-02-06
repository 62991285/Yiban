# 高风险药物关键词检索工具

## 功能介绍

这是一个用于从文本中检索高风险药物关键词的工具，主要用于医疗相关应用场景，帮助识别文本中包含的高风险药物名称。

## 核心功能

- **药物检索**：从文本中检索高风险药物名称
- **精确匹配**：支持精确匹配药物名称
- **大小写处理**：支持区分或不区分大小写的搜索
- **分类返回**：支持返回药物所属分类
- **批量搜索**：支持同时搜索多个文本
- **子字符串处理**：支持移除子字符串匹配，避免重复结果
- **数据管理**：支持添加、移除、清空药物数据
- **JSON导入**：支持从JSON文件导入药物数据

## 快速开始

### 1. 导入模块

```javascript
const drugSearch = require('./drugSearch');
```

### 2. 初始化药物数据

```javascript
// 从JSON文件加载药物数据
drugSearch.loadDrugsFromJson((drugs) => {
  console.log(`加载了 ${drugs.length} 种药物`);
});

// 或导入所有可用的药物数据
drugSearch.importAllDrugs();
```

### 3. 搜索药物

```javascript
// 基本搜索
const text = '患者需要服用阿莫西林和布洛芬';
const results = drugSearch.searchDrugs(text);
console.log(results); // 输出: ['阿莫西林', '布洛芬']

// 高级搜索选项
const advancedResults = drugSearch.searchDrugs(text, {
  caseSensitive: false,      // 是否区分大小写
  returnCategories: true,    // 是否返回药物分类
  exactMatch: false,         // 是否精确匹配
  sortByLength: true,        // 是否按长度排序
  removeSubstrings: true     // 是否移除子字符串匹配
});
```

### 4. 批量搜索

```javascript
const texts = [
  '患者需要服用阿莫西林',
  '患者需要服用布洛芬',
  '患者需要服用阿司匹林'
];

const batchResults = drugSearch.batchSearchDrugs(texts);
console.log(batchResults);
```

### 5. 检查是否包含高风险药物

```javascript
const text = '患者需要服用阿莫西林';
const containsHighRisk = drugSearch.containsHighRiskDrugs(text);
console.log(containsHighRisk); // 输出: true
```

## API 参考

### 数据管理

- **initDrugData(drugs)**：初始化药物数据
- **initDrugCategories(categories)**：初始化药物分类数据
- **addDrugs(drugs, category)**：添加药物到列表
- **removeDrugs(drugs)**：从列表中移除药物
- **clearDrugData()**：清空药物数据
- **importAllDrugs()**：导入所有可用的药物数据（从JSON文件）

### 搜索功能

- **searchDrugs(input, options)**：从字符串中检索药物名称
- **batchSearchDrugs(inputs, options)**：批量检索多个字符串中的药物名称
- **containsHighRiskDrugs(input, options)**：检查字符串是否包含高风险药物

### 查询功能

- **getDrugCategories(drug)**：获取药物所属分类
- **getDrugList()**：获取当前药物列表
- **getDrugCategoriesList()**：获取药物分类列表

### 数据加载功能

- **loadDrugsFromJson(callback)**：从JSON文件加载药物数据

## 性能优化

1. **Trie树索引**：使用Trie树数据结构加速字符串包含匹配
2. **缓存机制**：缓存搜索结果，提高重复搜索的性能
3. **数据去重**：自动去除重复的药物名称，减少存储和搜索开销
4. **子字符串处理**：自动移除子字符串匹配，避免重复结果

## 示例代码

### 完整使用示例

```javascript
const drugSearch = require('./drugSearch');

// 初始化药物数据
drugSearch.loadDrugsFromJson((drugs) => {
  console.log(`加载了 ${drugs.length} 种药物`);
  
  // 示例1：基本搜索
  const text1 = '患者需要服用阿莫西林和布洛芬';
  const results1 = drugSearch.searchDrugs(text1);
  console.log('基本搜索结果:', results1);
  
  // 示例2：高级搜索
  const text2 = '患者需要服用AMOXICILLIN';
  const results2 = drugSearch.searchDrugs(text2, {
    caseSensitive: false,
    returnCategories: true
  });
  console.log('高级搜索结果:', results2);
  
  // 示例3：批量搜索
  const texts = [
    '患者需要服用阿莫西林',
    '患者需要服用布洛芬',
    '患者需要服用阿司匹林'
  ];
  const batchResults = drugSearch.batchSearchDrugs(texts);
  console.log('批量搜索结果:', batchResults);
  
  // 示例4：检查是否包含高风险药物
  const text3 = '患者需要服用维生素C';
  const containsHighRisk = drugSearch.containsHighRiskDrugs(text3);
  console.log('是否包含高风险药物:', containsHighRisk);
});
```

## 注意事项

1. **JSON文件格式**：药物数据存储在`../resources/drugs.js`文件中，使用JavaScript模块导出格式

2. **性能考虑**：对于大量文本的搜索，建议使用批量搜索功能，以减少重复初始化开销

3. **数据更新**：当药物数据发生变化时，工具会自动更新内部索引和缓存

4. **默认数据**：如果未加载外部数据，需要先调用`loadDrugsFromJson`或`importAllDrugs`加载数据

## 依赖

- **../resources/drugs.js**：包含药物数据的JavaScript模块

## 版本历史

### v1.0.0
- 初始版本
- 支持基本的药物检索功能
- 支持从JSON文件导入药物数据

### v1.1.0
- 优化了搜索性能，使用Trie树加速搜索
- 添加了缓存机制，提高重复搜索的性能
- 增强了搜索选项，支持更多配置

### v1.2.0
- 添加了子字符串处理功能，避免重复结果
- 增加了containsHighRiskDrugs辅助函数
- 优化了内存使用，减少了冗余数据