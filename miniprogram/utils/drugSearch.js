// 药物关键词检索工具

// 药物数据存储
let drugList = [];
let drugCategories = {};
let drugSet = new Set(); // 用于快速精确匹配
let searchResultCache = new Map(); // 用于缓存搜索结果

// Trie树实现，用于高效的包含匹配
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.originalWord = null; // 存储原始大小写的药物名称
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  
  insert(word) {
    let node = this.root;
    const lowerWord = word.toLowerCase();
    
    for (const char of lowerWord) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    
    node.isEndOfWord = true;
    node.originalWord = word;
  }
  
  searchAllInText(text) {
    const foundWords = new Set();
    const processedText = text.toLowerCase();
    
    for (let i = 0; i < processedText.length; i++) {
      let node = this.root;
      
      for (let j = i; j < processedText.length; j++) {
        const char = processedText[j];
        if (!node.children.has(char)) {
          break;
        }
        
        node = node.children.get(char);
        if (node.isEndOfWord) {
          foundWords.add(node.originalWord);
        }
      }
    }
    
    return Array.from(foundWords);
  }
}

let drugTrie = new Trie(); // 用于高效的包含匹配

/**
 * 初始化药物数据
 * @param {Array} drugs - 药物名称数组
 */
function initDrugData(drugs) {
  if (Array.isArray(drugs)) {
    // 去重处理
    const uniqueDrugs = [...new Set(drugs)];
    drugList = uniqueDrugs;
    
    // 初始化快速匹配数据结构
    drugSet = new Set(uniqueDrugs);
    
    // 重建Trie树
    drugTrie = new Trie();
    uniqueDrugs.forEach(drug => {
      drugTrie.insert(drug);
    });
    
    // 清空缓存
    searchResultCache.clear();
  }
}

/**
 * 初始化药物分类数据
 * @param {Object} categories - 药物分类对象，格式为 {分类名称: [药物名称数组]}
 */
function initDrugCategories(categories) {
  if (typeof categories === 'object' && categories !== null) {
    drugCategories = categories;
  }
}

/**
 * 从字符串中检索药物名称
 * @param {string} input - 输入字符串
 * @param {Object} options - 搜索选项
 * @param {boolean} options.caseSensitive - 是否区分大小写，默认为false
 * @param {boolean} options.returnCategories - 是否返回药物分类，默认为false
 * @param {boolean} options.exactMatch - 是否精确匹配，默认为false
 * @param {boolean} options.sortByLength - 是否按药物名称长度排序，默认为true
 * @param {boolean} options.removeSubstrings - 是否移除子字符串匹配，默认为true
 * @returns {Array} - 检索到的药物名称数组或包含分类的对象数组
 */
function searchDrugs(input, options = {}) {
  if (typeof input !== 'string') {
    return [];
  }
  
  console.log('搜索输入:', input);
  console.log('当前药物列表长度:', drugList.length);
  
  const { 
    caseSensitive = false, 
    returnCategories = false, 
    exactMatch = false, 
    sortByLength = true,
    removeSubstrings = true
  } = options;
  
  const processedInput = caseSensitive ? input : input.toLowerCase();
  
  //生成缓存键
  const cacheKey = `${processedInput}_${caseSensitive}_${returnCategories}_${exactMatch}_${sortByLength}_${removeSubstrings}`;
  
  // 检查缓存
  if (searchResultCache.has(cacheKey)) {
    console.log('使用缓存结果');
    return searchResultCache.get(cacheKey);
  }
  
  let foundDrugs = [];
  
  // 优化：如果药物列表为空，直接返回
  if (drugList.length === 0) {
    console.log('药物列表为空');
    searchResultCache.set(cacheKey, foundDrugs);
    return foundDrugs;
  }
  
  // 优化：如果输入字符串太短，跳过搜索
  if (processedInput.length < 2) {
    console.log('输入字符串太短');
    searchResultCache.set(cacheKey, foundDrugs);
    return foundDrugs;
  }
  
  if (exactMatch) {
    // 精确匹配：使用Set进行O(1)查找
    const matchedDrug = caseSensitive ? 
      drugList.find(d => d === input) : 
      drugList.find(d => d.toLowerCase() === processedInput);
    
    if (matchedDrug) {
      foundDrugs = [matchedDrug];
    }
  } else {
    // 包含匹配：首先使用Trie树进行高效查找
    foundDrugs = drugTrie.searchAllInText(input);
    console.log('Trie树搜索结果:', foundDrugs.length);
    
    // 如果Trie树搜索没有结果，使用简单的包含匹配作为备选方案
    if (foundDrugs.length === 0) {
      const processedInput = caseSensitive ? input : input.toLowerCase();
      foundDrugs = drugList.filter(drug => {
        const processedDrug = caseSensitive ? drug : drug.toLowerCase();
        return processedDrug.includes(processedInput);
      });
      console.log('包含匹配搜索结果:', foundDrugs.length);
    }
    
    // 移除子字符串匹配（例如：如果找到了"阿莫西林胶囊"，则移除"阿莫西林"）
    if (removeSubstrings && foundDrugs.length > 1) {
      const sortedDrugs = [...foundDrugs].sort((a, b) => b.length - a.length);
      const uniqueDrugs = [];
      
      for (const drug of sortedDrugs) {
        if (!uniqueDrugs.some(existingDrug => existingDrug.includes(drug))) {
          uniqueDrugs.push(drug);
        }
      }
      
      foundDrugs = uniqueDrugs;
    }
  }
  
  console.log('最终搜索结果:', foundDrugs.length);
  
  // 构建结果数组
  const result = [];
  for (const drug of foundDrugs) {
    if (returnCategories) {
      const categories = getDrugCategories(drug);
      result.push({ name: drug, categories });
    } else {
      result.push(drug);
    }
  }
  
  // 按药物名称长度排序（长的在前，避免子字符串匹配）
  if (sortByLength) {
    result.sort((a, b) => {
      const lenA = typeof a === 'string' ? a.length : a.name.length;
      const lenB = typeof b === 'string' ? b.length : b.name.length;
      return lenB - lenA;
    });
  }
  
  // 缓存结果
  searchResultCache.set(cacheKey, result);
  
  return result;
}

/**
 * 批量检索多个字符串中的药物名称
 * @param {Array} inputs - 输入字符串数组
 * @param {Object} options - 搜索选项，同searchDrugs
 * @returns {Array} - 每个输入字符串对应的检索结果数组
 */
function batchSearchDrugs(inputs, options = {}) {
  if (!Array.isArray(inputs)) {
    return [];
  }
  
  return inputs.map(input => searchDrugs(input, options));
}

/**
 * 获取药物所属分类
 * @param {string} drug - 药物名称
 * @returns {Array} - 药物所属分类数组
 */
function getDrugCategories(drug) {
  const categories = [];
  for (const [category, drugs] of Object.entries(drugCategories)) {
    if (drugs.includes(drug)) {
      categories.push(category);
    }
  }
  return categories;
}

/**
 * 获取当前药物列表
 * @returns {Array} - 药物名称数组
 */
function getDrugList() {
  return [...drugList];
}

/**
 * 获取药物分类列表
 * @returns {Object} - 药物分类对象
 */
function getDrugCategoriesList() {
  return { ...drugCategories };
}

/**
 * 添加药物到列表
 * @param {string|Array} drugs - 药物名称或药物名称数组
 * @param {string} category - 药物分类（可选）
 */
function addDrugs(drugs, category = null) {
  const drugsToAdd = Array.isArray(drugs) ? drugs : [drugs];
  let hasChanged = false;
  
  for (const drug of drugsToAdd) {
    if (typeof drug === 'string' && !drugList.includes(drug)) {
      drugList.push(drug);
      drugSet.add(drug);
      drugTrie.insert(drug);
      hasChanged = true;
    }
    
    if (category && typeof drug === 'string') {
      if (!drugCategories[category]) {
        drugCategories[category] = [];
      }
      if (!drugCategories[category].includes(drug)) {
        drugCategories[category].push(drug);
      }
    }
  }
  
  // 如果药物列表发生变化，清空缓存
  if (hasChanged) {
    searchResultCache.clear();
  }
}

/**
 * 从列表中移除药物
 * @param {string|Array} drugs - 药物名称或药物名称数组
 */
function removeDrugs(drugs) {
  const drugsToRemove = Array.isArray(drugs) ? drugs : [drugs];
  const initialLength = drugList.length;
  
  // 从药物列表中移除
  drugList = drugList.filter(drug => !drugsToRemove.includes(drug));
  
  // 更新drugSet
  drugSet = new Set(drugList);
  
  // 重建Trie树
  drugTrie = new Trie();
  drugList.forEach(drug => {
    drugTrie.insert(drug);
  });
  
  // 从分类中移除
  for (const category in drugCategories) {
    drugCategories[category] = drugCategories[category].filter(
      drug => !drugsToRemove.includes(drug)
    );
  }
  
  // 如果药物列表发生变化，清空缓存
  if (drugList.length !== initialLength) {
    searchResultCache.clear();
  }
}

/**
 * 清空药物数据
 */
function clearDrugData() {
  drugList = [];
  drugCategories = {};
  drugSet = new Set();
  drugTrie = new Trie();
  searchResultCache.clear();
}

/**
 * 从JSON文件加载药物数据
 * @param {Function} callback - 加载完成后的回调函数
 * @returns {Array} - 加载的药物列表
 */
function loadDrugsFromJson(callback) {
  try {
    // 在小程序环境中使用require加载药物数据
    const drugData = require('../resources/drugs');
    const jsonDrugs = drugData.drugs || [];
    
    console.log('drugData:', drugData);
    console.log('jsonDrugs.length:', jsonDrugs.length);
    
    if (jsonDrugs.length > 0) {
      // 初始化药物数据
      initDrugData(jsonDrugs);
      console.log(`从药物数据文件加载了 ${jsonDrugs.length} 种药物`);
      console.log('当前药物列表长度:', drugList.length);
    }
    
    if (callback) {
      callback(jsonDrugs);
    }
    
    return jsonDrugs;
  } catch (error) {
    console.error('从药物数据文件加载药物数据失败:', error);
    if (callback) {
      callback([]);
    }
    return [];
  }
}

/**
 * 导入所有可用的药物数据（仅从drugs.json）
 * @returns {Array} - 导入的药物列表
 */
function importAllDrugs() {
  return loadDrugsFromJson();
}

/**
 * 检查字符串是否包含高风险药物
 * @param {string} input - 输入字符串
 * @param {Object} options - 搜索选项，同searchDrugs
 * @returns {boolean} - 是否包含高风险药物
 */
function containsHighRiskDrugs(input, options = {}) {
  const results = searchDrugs(input, options);
  return results.length > 0;
}

// 导出函数模块
module.exports = {
  // 数据管理
  initDrugData,
  initDrugCategories,
  addDrugs,
  removeDrugs,
  clearDrugData,
  importAllDrugs,
  
  // 搜索功能
  searchDrugs,
  batchSearchDrugs,
  containsHighRiskDrugs,
  
  // 查询功能
  getDrugCategories,
  getDrugList,
  getDrugCategoriesList,
  
  // 数据加载功能
  loadDrugsFromJson
};
