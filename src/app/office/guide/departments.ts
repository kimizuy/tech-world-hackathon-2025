// City hall department definitions
export interface Department {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  floor?: string;
  counter?: string;
}

export const departments: Department[] = [
  {
    id: "resident",
    name: "住民課",
    description:
      "住民票、戸籍、印鑑登録、マイナンバーカードに関する手続きを担当",
    keywords: [
      "住民票",
      "戸籍",
      "印鑑登録",
      "引越し",
      "転入届",
      "転出届",
      "マイナンバー",
      "本人確認書類",
      "出生届",
      "死亡届",
      "婚姻届",
      "離婚届",
    ],
    floor: "1階",
    counter: "1番窓口",
  },
  {
    id: "tax",
    name: "税務課",
    description: "住民税、固定資産税、軽自動車税などの税金に関する手続きを担当",
    keywords: [
      "税金",
      "住民税",
      "固定資産税",
      "軽自動車税",
      "納税証明",
      "確定申告",
      "所得証明",
      "課税証明",
      "税額",
      "納付",
    ],
    floor: "1階",
    counter: "2番窓口",
  },
  {
    id: "insurance",
    name: "保険年金課",
    description: "国民健康保険、国民年金、後期高齢者医療に関する手続きを担当",
    keywords: [
      "国民健康保険",
      "国保",
      "年金",
      "国民年金",
      "後期高齢者",
      "医療費",
      "保険証",
      "保険料",
      "扶養",
    ],
    floor: "1階",
    counter: "3番窓口",
  },
  {
    id: "welfare",
    name: "福祉課",
    description: "障害者支援、高齢者福祉、生活保護に関する相談・手続きを担当",
    keywords: [
      "福祉",
      "障害",
      "障害者手帳",
      "介護",
      "介護保険",
      "高齢者",
      "生活保護",
      "ヘルパー",
      "デイサービス",
      "施設入所",
    ],
    floor: "2階",
    counter: "1番窓口",
  },
  {
    id: "childcare",
    name: "子育て支援課",
    description:
      "児童手当、保育園、子育て相談、ひとり親支援に関する手続きを担当",
    keywords: [
      "子育て",
      "児童手当",
      "保育園",
      "幼稚園",
      "こども",
      "子供",
      "育児",
      "ひとり親",
      "母子",
      "父子",
      "乳幼児健診",
      "予防接種",
    ],
    floor: "2階",
    counter: "2番窓口",
  },
  {
    id: "environment",
    name: "環境課",
    description: "ゴミ収集、リサイクル、環境問題に関する相談を担当",
    keywords: [
      "ゴミ",
      "ごみ",
      "粗大ゴミ",
      "リサイクル",
      "環境",
      "分別",
      "収集日",
      "不法投棄",
    ],
    floor: "2階",
    counter: "3番窓口",
  },
  {
    id: "construction",
    name: "建設課",
    description: "道路、公園、建築確認、開発許可に関する相談・手続きを担当",
    keywords: [
      "道路",
      "公園",
      "建築",
      "建築確認",
      "開発",
      "土地",
      "上下水道",
      "水道",
      "工事",
    ],
    floor: "3階",
    counter: "1番窓口",
  },
  {
    id: "general",
    name: "総務課",
    description: "市役所全般の問い合わせ、情報公開、その他の相談を担当",
    keywords: [
      "問い合わせ",
      "その他",
      "情報公開",
      "選挙",
      "投票",
      "広報",
      "相談",
    ],
    floor: "3階",
    counter: "総合案内",
  },
];

export function findDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
