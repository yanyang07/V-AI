
import { Scholar, Paper, Institution, TrendData, SocialPost, RegionData, HotWord, Project, News } from './types';

export const REGIONS_LIST: RegionData[] = [
  {
    id: 'USA',
    name: 'USA',
    influenceScores: [
      { label: 'Volume (科研体量)', value: 145, fullMark: 150 },
      { label: 'Quality (科研质量)', value: 148, fullMark: 150 },
      { label: 'Density (人才浓度)', value: 140, fullMark: 150 },
      { label: 'Frontier (前沿技术)', value: 142, fullMark: 150 },
      { label: 'Innovation (产业创新)', value: 144, fullMark: 150 },
      { label: 'Connectivity (全球连接)', value: 135, fullMark: 150 },
    ],
    rankHistory: [
      { year: 2020, rank: 1, score: 92 },
      { year: 2021, rank: 1, score: 94 },
      { year: 2022, rank: 1, score: 95 },
      { year: 2023, rank: 1, score: 97 },
      { year: 2024, rank: 1, score: 98 },
    ]
  },
  {
    id: 'China',
    name: 'China',
    influenceScores: [
      { label: 'Volume (科研体量)', value: 148, fullMark: 150 },
      { label: 'Quality (科研质量)', value: 128, fullMark: 150 },
      { label: 'Density (人才浓度)', value: 138, fullMark: 150 },
      { label: 'Frontier (前沿技术)', value: 144, fullMark: 150 },
      { label: 'Innovation (产业创新)', value: 146, fullMark: 150 },
      { label: 'Connectivity (全球连接)', value: 120, fullMark: 150 },
    ],
    rankHistory: [
      { year: 2020, rank: 3, score: 85 },
      { year: 2021, rank: 2, score: 88 },
      { year: 2022, rank: 2, score: 91 },
      { year: 2023, rank: 2, score: 94 },
      { year: 2024, rank: 2, score: 97 },
    ]
  },
  {
    id: 'EU',
    name: 'EU',
    influenceScores: [
      { label: 'Volume (科研体量)', value: 115, fullMark: 150 },
      { label: 'Quality (科研质量)', value: 135, fullMark: 150 },
      { label: 'Density (人才浓度)', value: 130, fullMark: 150 },
      { label: 'Frontier (前沿技术)', value: 118, fullMark: 150 },
      { label: 'Innovation (产业创新)', value: 110, fullMark: 150 },
      { label: 'Connectivity (全球连接)', value: 145, fullMark: 150 },
    ],
    rankHistory: [
      { year: 2020, rank: 2, score: 88 },
      { year: 2021, rank: 3, score: 87 },
      { year: 2022, rank: 3, score: 86 },
      { year: 2023, rank: 3, score: 89 },
      { year: 2024, rank: 3, score: 91 },
    ]
  }
];

export const REGIONS = REGIONS_LIST.map(r => r.name);

const generateScholarTrend = (startValue: number) => {
  let current = startValue;
  return [2020, 2021, 2022, 2023, 2024].map((year, index) => {
    const val = current;
    current += (15 + Math.random() * 25 + (index * 5));
    return { year, value: Math.round(val) };
  });
};

export const HOT_WORDS_MOCK: HotWord[] = [
  { id: 'hw1', word: 'Skill', category: 'Technology', heat: 98, trend: [20, 45, 60, 85, 98] },
  { id: 'hw2', word: 'Clawd Bot', category: 'Product', heat: 95, trend: [10, 30, 50, 92, 95] },
  { id: 'hw3', word: 'AGI', category: 'Technology', heat: 92, trend: [5, 15, 40, 75, 92] },
  { id: 'hw4', word: 'Agent', category: 'Technology', heat: 88, trend: [20, 35, 55, 78, 88] },
  { id: 'hw5', word: 'Claude', category: 'Product', heat: 85, trend: [0, 10, 25, 65, 85] },
  { id: 'hw6', word: 'AI4S', category: 'Technology', heat: 82, trend: [10, 25, 45, 65, 82] },
  { id: 'hw7', word: 'NVIDIA', category: 'Company', heat: 96, trend: [30, 45, 60, 75, 96] },
  { id: 'hw8', word: 'Sam Altman', category: 'Person', heat: 90, trend: [40, 50, 65, 80, 90] },
  { id: 'hw9', word: 'OpenAI', category: 'Company', heat: 94, trend: [50, 60, 75, 88, 94] },
  { id: 'hw10', word: 'Sora', category: 'Product', heat: 80, trend: [0, 5, 20, 70, 80] },
];

export const PROJECTS_MOCK: Project[] = [
  { 
    id: 'pr1', 
    name: 'Prem95/socialautonomies', 
    stars: '1.2K', 
    description: 'Autonomous social networking simulation.', 
    trend: [10, 30, 50, 85], 
    category: 'Agent',
    url: 'https://github.com/Prem95/socialautonomies?'
  },
  { 
    id: 'pr2', 
    name: 'hireshBrem/X-ai-agent', 
    stars: '2.5K', 
    description: 'X-integrated AI agent for autonomous engagement.', 
    trend: [5, 25, 80, 98], 
    category: 'X-AI',
    url: 'https://github.com/hireshBrem/X-ai-agent?'
  },
];

export const NEWS_MOCK: News[] = [
  { id: 'nw1', title: 'OpenAI announces o1: A new reasoning model', source: 'OpenAI Blog', time: '2h ago', sentiment: 'positive' },
  { id: 'nw2', title: 'NVIDIA hits new market cap record', source: 'Reuters', time: '5h ago', sentiment: 'positive' },
  { id: 'nw3', title: 'Global AI Safety Summit reaches landmark deal', source: 'BBC News', time: '1d ago', sentiment: 'neutral' },
  { id: 'nw4', title: 'Claude 3.5 Sonnet released to public', source: 'TechCrunch', time: '2d ago', sentiment: 'positive' },
];

const SCHOLAR_RADAR_LABELS = [
  '产出力 (Productivity)',
  '学术影响力 (Academic)',
  '领域主导力 (Dominance)',
  '趋势敏感度 (Sensitivity)',
  '合作影响半径 (Radius)',
  '社区影响力 (Community)'
];

export const SCHOLARS_MOCK: Scholar[] = [
  { 
    id: 's5', 
    nameEn: 'Andreј Karpathy', 
    nameZh: '安德烈·卡帕斯', 
    institution: ['Eureka Labs', 'Tesla', 'OpenAI'], 
    field: ['Deep Learning', 'Computer Vision'], 
    avatar: 'AK', 
    region: 'USA',
    awards: [{ year: 2022, name: 'Innovators Under 35', organization: 'MIT' }], 
    hotness: 110000,
    email: 'andrej@karpathy.ai',
    citations: 155000,
    migration: [{ year: 2017, institution: 'Tesla' }, { year: 2023, institution: 'OpenAI' }, { year: 2024, institution: 'Eureka' }],
    influenceScores: SCHOLAR_RADAR_LABELS.map(l => ({ label: l, value: 140 + Math.random() * 10, fullMark: 150 })),
    rankHistory: [{ year: 2024, rank: 1, score: 99 }],
    trendData: generateScholarTrend(90),
    teachers: [],
    students: []
  },
  { 
    id: 's1', 
    nameEn: 'Peter Steinberger', 
    nameZh: '彼得·斯坦伯格', 
    institution: ['PSPDFKit', 'Venture Capital'], 
    field: ['Software Engineering', 'Mobile Development'], 
    avatar: 'PS', 
    region: 'Austria',
    awards: [{ year: 2021, name: 'Tech Excellence', organization: 'Wired' }], 
    hotness: 563,
    email: 'peter@pspdfkit.com',
    citations: 12000,
    migration: [{ year: 2011, institution: 'PSP' }],
    influenceScores: SCHOLAR_RADAR_LABELS.map(l => ({ label: l, value: 110 + Math.random() * 30, fullMark: 150 })),
    rankHistory: [{ year: 2024, rank: 5, score: 92 }],
    trendData: generateScholarTrend(70),
    teachers: [],
    students: []
  },
  { 
    id: 's2', 
    nameEn: 'Toran Bruce Richards', 
    nameZh: '托兰·布鲁斯·理查兹', 
    institution: ['Significant Gravitas', 'AutoGPT'], 
    field: ['Agentic AI', 'Autonomous Systems'], 
    avatar: 'TR', 
    region: 'UK',
    awards: [{ year: 2023, name: 'Innovation Award', organization: 'GitHub' }], 
    hotness: 199,
    email: 'toran@autogpt.com',
    citations: 8500,
    migration: [{ year: 2023, institution: 'AutoGPT' }],
    influenceScores: SCHOLAR_RADAR_LABELS.map(l => ({ label: l, value: 120 + Math.random() * 25, fullMark: 150 })),
    rankHistory: [{ year: 2024, rank: 4, score: 95 }],
    trendData: generateScholarTrend(75),
    teachers: [],
    students: []
  },
  { 
    id: 's3', 
    nameEn: 'Dmitry Shapiro', 
    nameZh: '德米特里·沙皮罗', 
    institution: ['YouAi', 'MindStudio'], 
    field: ['Generative AI', 'Human-AI Interaction'], 
    avatar: 'DS', 
    region: 'USA',
    awards: [{ year: 2024, name: 'AI Visionary', organization: 'TechCrunch' }], 
    hotness: 92,
    email: 'dmitry@youai.ai',
    citations: 5400,
    migration: [{ year: 2022, institution: 'YouAi' }],
    influenceScores: SCHOLAR_RADAR_LABELS.map(l => ({ label: l, value: 105 + Math.random() * 35, fullMark: 150 })),
    rankHistory: [{ year: 2024, rank: 6, score: 90 }],
    trendData: generateScholarTrend(65),
    teachers: [],
    students: []
  },
  { 
    id: 's4', 
    nameEn: 'Dario Amodei', 
    nameZh: '达里奥·阿莫代', 
    institution: ['Anthropic', 'OpenAI'], 
    field: ['AI Safety', 'LLM Alignment'], 
    avatar: 'DA', 
    region: 'USA',
    awards: [{ year: 2023, name: 'Top Influencer', organization: 'Time' }], 
    hotness: 98,
    email: 'dario@anthropic.com',
    citations: 45000,
    migration: [{ year: 2016, institution: 'OpenAI' }, { year: 2021, institution: 'Anthropic' }],
    influenceScores: SCHOLAR_RADAR_LABELS.map(l => ({ label: l, value: 135 + Math.random() * 15, fullMark: 150 })),
    rankHistory: [{ year: 2024, rank: 2, score: 98 }],
    trendData: generateScholarTrend(85),
    teachers: [],
    students: []
  },
  ...Array.from({ length: 18 }).map((_, i) => ({
    id: `mock-${i}`,
    nameEn: `Scholar Alpha ${i}`,
    nameZh: `学者 ${i}`,
    institution: ['Stanford', 'Google'],
    field: ['LLMs', 'RL'],
    avatar: 'A' + i,
    region: i % 2 === 0 ? 'USA' : 'China',
    awards: [{ year: 2020 + (i % 5), name: 'Top AI Award', organization: 'AAAI' }],
    hotness: 70 + (i % 30),
    email: `scholar${i}@stanford.edu`,
    citations: 5000 + (i * 1000),
    migration: [{ year: 2010, institution: 'MIT' }],
    influenceScores: SCHOLAR_RADAR_LABELS.map(l => ({ label: l, value: 50 + Math.random() * 80, fullMark: 150 })),
    rankHistory: [
      { year: 2020, rank: 20, score: 40 + i },
      { year: 2024, rank: 10, score: 70 + i }
    ],
    trendData: generateScholarTrend(50 + (i % 20)),
    teachers: [],
    students: []
  }))
];

export const INSTITUTIONS_MOCK: Institution[] = [
  {
    id: 'i1',
    name: 'OpenAI',
    logo: 'O',
    region: 'USA',
    description: 'Leading AI research laboratory focusing on AGI. Creator of the GPT series, DALL-E, and Sora.',
    website: 'https://openai.com',
    staffCount: '2,500+',
    articleCount: 450,
    productCount: 12,
    hotness: 99.9,
    fundingStatus: 'Invested',
    lastAmount: '$13B+',
    investors: ['Microsoft', 'Thrive Capital', 'Sequoia', 'K2 Global', 'Andreessen Horowitz'],
    portfolio: ['Descript', 'Harvey', 'Cursor', 'Figure AI', '1X'],
    fundingTrend: [
      { year: '2019', amount: 1000, label: '$1B (MSFT)' },
      { year: '2021', amount: 1200, label: 'Secondary' },
      { year: '2023', amount: 10000, label: '$10B (MSFT)' },
      { year: '2024', amount: 14000, label: 'Secondary ($80B Val)' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 150, fullMark: 150 },
      { label: 'Research', value: 148, fullMark: 150 },
      { label: 'Talent', value: 150, fullMark: 150 },
      { label: 'Impact', value: 150, fullMark: 150 },
      { label: 'Growth', value: 145, fullMark: 150 },
      { label: 'Network', value: 148, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 1, score: 99 }]
  },
  {
    id: 'i2',
    name: 'Anthropic',
    logo: 'A',
    region: 'USA',
    description: 'AI safety and research company building reliable, interpretable, and steerable AI systems (Claude).',
    website: 'https://www.anthropic.com',
    staffCount: '500+',
    articleCount: 120,
    productCount: 5,
    hotness: 97.5,
    fundingStatus: 'Invested',
    lastAmount: '$7B+',
    investors: ['Amazon', 'Google', 'Salesforce Ventures', 'Zoom Ventures', 'Spark Capital'],
    portfolio: ['Internal Alignment Research'],
    fundingTrend: [
      { year: '2021', amount: 124, label: 'Series A' },
      { year: '2022', amount: 580, label: 'Series B' },
      { year: '2023', amount: 4000, label: 'Amazon Strategic' },
      { year: '2024', amount: 2000, label: 'Google Strategic' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 142, fullMark: 150 },
      { label: 'Research', value: 145, fullMark: 150 },
      { label: 'Talent', value: 140, fullMark: 150 },
      { label: 'Impact', value: 144, fullMark: 150 },
      { label: 'Growth', value: 148, fullMark: 150 },
      { label: 'Network', value: 135, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 3, score: 95 }]
  },
  {
    id: 'i3',
    name: 'Google DeepMind',
    logo: 'G',
    region: 'UK/USA',
    description: 'Solving intelligence to advance science. Creators of AlphaGo, AlphaFold, and Gemini.',
    website: 'https://deepmind.google',
    staffCount: '2,000+',
    articleCount: 1500,
    productCount: 20,
    hotness: 98.8,
    fundingStatus: 'Internal',
    lastAmount: 'N/A (Alphabet)',
    investors: ['Alphabet Inc. (Parent)'],
    portfolio: ['Isomorphic Labs (Spin-off)'],
    fundingTrend: [
      { year: '2014', amount: 500, label: 'Acquisition' },
      { year: '2020', amount: 1000, label: 'Internal Budget' },
      { year: '2024', amount: 2000, label: 'Merged w/ Brain' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 148, fullMark: 150 },
      { label: 'Research', value: 150, fullMark: 150 },
      { label: 'Talent', value: 148, fullMark: 150 },
      { label: 'Impact', value: 148, fullMark: 150 },
      { label: 'Growth', value: 130, fullMark: 150 },
      { label: 'Network', value: 145, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 2, score: 97 }]
  },
  {
    id: 'i4',
    name: 'Microsoft AI',
    logo: 'M',
    region: 'USA',
    description: 'Advancing AI through Azure, Copilot, and research to empower every person and organization.',
    website: 'https://www.microsoft.com/ai',
    staffCount: '5,000+',
    articleCount: 2000,
    productCount: 50,
    hotness: 96.5,
    fundingStatus: 'Public',
    lastAmount: 'N/A (Public)',
    investors: ['Public Shareholders'],
    portfolio: ['OpenAI', 'Mistral AI', 'Inflection AI', 'G42'],
    fundingTrend: [
      { year: '2020', amount: 1000, label: 'R&D' },
      { year: '2023', amount: 13000, label: 'OpenAI Inv.' },
      { year: '2024', amount: 5000, label: 'Infrastructure' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 140, fullMark: 150 },
      { label: 'Research', value: 142, fullMark: 150 },
      { label: 'Talent', value: 145, fullMark: 150 },
      { label: 'Impact', value: 149, fullMark: 150 },
      { label: 'Growth', value: 140, fullMark: 150 },
      { label: 'Network', value: 150, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 4, score: 94 }]
  },
  {
    id: 'i5',
    name: 'LangChain',
    logo: 'L',
    region: 'USA',
    description: 'Building the standard infrastructure for developing applications powered by LLMs.',
    website: 'https://langchain.com',
    staffCount: '50-100',
    articleCount: 15,
    productCount: 3,
    hotness: 92.0,
    fundingStatus: 'Invested',
    lastAmount: '$30M+',
    investors: ['Sequoia Capital', 'Benchmark'],
    portfolio: ['Open Source Ecosystem'],
    fundingTrend: [
      { year: '2022', amount: 0, label: 'Founded' },
      { year: '2023', amount: 10, label: 'Seed' },
      { year: '2023', amount: 25, label: 'Series A' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 135, fullMark: 150 },
      { label: 'Research', value: 110, fullMark: 150 },
      { label: 'Talent', value: 120, fullMark: 150 },
      { label: 'Impact', value: 145, fullMark: 150 },
      { label: 'Growth', value: 150, fullMark: 150 },
      { label: 'Network', value: 148, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 6, score: 88 }]
  },
  {
    id: 'i6',
    name: 'TinyFish',
    logo: 'TF',
    region: 'USA (Est)',
    description: 'Specialized Web Agents startup focusing on retail and enterprise automation solutions.',
    website: '#',
    staffCount: '<20',
    articleCount: 2,
    productCount: 1,
    hotness: 82.5,
    fundingStatus: 'Invested',
    lastAmount: 'Seed (Est)',
    investors: ['Early Stage VCs', 'Angels'],
    portfolio: ['Retail Automation Agents'],
    fundingTrend: [
      { year: '2023', amount: 1, label: 'Pre-Seed' },
      { year: '2024', amount: 4, label: 'Seed Round' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 130, fullMark: 150 },
      { label: 'Research', value: 115, fullMark: 150 },
      { label: 'Talent', value: 120, fullMark: 150 },
      { label: 'Impact', value: 125, fullMark: 150 },
      { label: 'Growth', value: 135, fullMark: 150 },
      { label: 'Network', value: 110, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 9, score: 75 }]
  },
  {
    id: 'i7',
    name: 'Conscium',
    logo: 'C',
    region: 'UK (London)',
    description: 'Research lab dedicated to AI agent verification, reliability, and safety in autonomous systems.',
    website: 'https://www.conscium.ai',
    staffCount: '<50',
    articleCount: 12,
    productCount: 1,
    hotness: 85.0,
    fundingStatus: 'Invested',
    lastAmount: 'Undisclosed',
    investors: ['Safety Grants', 'European VCs'],
    portfolio: ['Agent Benchmark Frameworks'],
    fundingTrend: [
      { year: '2023', amount: 2, label: 'Grant' },
      { year: '2024', amount: 5, label: 'Seed' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 135, fullMark: 150 },
      { label: 'Research', value: 140, fullMark: 150 },
      { label: 'Talent', value: 130, fullMark: 150 },
      { label: 'Impact', value: 128, fullMark: 150 },
      { label: 'Growth', value: 120, fullMark: 150 },
      { label: 'Network', value: 125, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 8, score: 80 }]
  },
  {
    id: 'i8',
    name: 'Center for AI Safety (CAIS)',
    logo: 'CS',
    region: 'USA',
    description: 'Non-profit research organization dedicated to reducing societal-scale risks from AI.',
    website: 'https://www.safe.ai',
    staffCount: '~50',
    articleCount: 85,
    productCount: 0,
    hotness: 88.5,
    fundingStatus: 'Non-Profit',
    lastAmount: 'Grants',
    investors: ['Open Philanthropy', 'Vitalik Buterin', 'Dustin Moskovitz'],
    portfolio: ['Safety Curriculum', 'Compute Governance'],
    fundingTrend: [
      { year: '2022', amount: 5, label: 'Initial' },
      { year: '2023', amount: 15, label: 'Donations' },
      { year: '2024', amount: 20, label: 'Scale Up' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 120, fullMark: 150 },
      { label: 'Research', value: 145, fullMark: 150 },
      { label: 'Talent', value: 135, fullMark: 150 },
      { label: 'Impact', value: 148, fullMark: 150 },
      { label: 'Growth', value: 125, fullMark: 150 },
      { label: 'Network', value: 145, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 7, score: 85 }]
  },
  {
    id: 'i9',
    name: 'EleutherAI',
    logo: 'E',
    region: 'Global',
    description: 'Grassroots non-profit AI research lab focusing on open-source LLMs and interpretability.',
    website: 'https://www.eleuther.ai',
    staffCount: 'Decentralized',
    articleCount: 150,
    productCount: 10,
    hotness: 90.5,
    fundingStatus: 'Non-Profit',
    lastAmount: 'Donations',
    investors: ['Hugging Face', 'Stability AI', 'CoreWeave'],
    portfolio: ['GPT-Neo', 'GPT-J', 'Pythia'],
    fundingTrend: [
      { year: '2020', amount: 0, label: 'Volunteer' },
      { year: '2022', amount: 1, label: 'Compute Grants' },
      { year: '2023', amount: 5, label: 'Sponsorships' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 138, fullMark: 150 },
      { label: 'Research', value: 140, fullMark: 150 },
      { label: 'Talent', value: 135, fullMark: 150 },
      { label: 'Impact', value: 142, fullMark: 150 },
      { label: 'Growth', value: 120, fullMark: 150 },
      { label: 'Network', value: 148, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 7, score: 86 }]
  },
  {
    id: 'i10',
    name: 'Cognition Labs',
    logo: 'CL',
    region: 'USA',
    description: 'Applied AI lab focused on reasoning. Creators of Devin, the autonomous AI software engineer.',
    website: 'https://www.cognition-labs.com',
    staffCount: '<50',
    articleCount: 5,
    productCount: 1,
    hotness: 95.0,
    fundingStatus: 'Invested',
    lastAmount: '$175M (Series B)',
    investors: ['Founders Fund', 'Patrick Collison', 'Elad Gil'],
    portfolio: ['Devin (Product)'],
    fundingTrend: [
      { year: '2023', amount: 0, label: 'Founded' },
      { year: '2024', amount: 21, label: 'Series A' },
      { year: '2024', amount: 175, label: 'Series B ($2B Val)' }
    ],
    influenceScores: [
      { label: 'Innovation', value: 148, fullMark: 150 },
      { label: 'Research', value: 135, fullMark: 150 },
      { label: 'Talent', value: 145, fullMark: 150 },
      { label: 'Impact', value: 146, fullMark: 150 },
      { label: 'Growth', value: 150, fullMark: 150 },
      { label: 'Network', value: 130, fullMark: 150 },
    ],
    rankHistory: [{ year: 2024, rank: 5, score: 92 }]
  }
];

export const REGIONAL_TRENDS: Record<string, any[]> = {
  USA: [
    { time: '2020', papers: 800, funding: 400, social: 1200, news: 300, compositeIndex: 40 },
    { time: '2021', papers: 1100, funding: 600, social: 2500, news: 500, compositeIndex: 55 },
    { time: '2022', papers: 1800, funding: 1200, social: 5000, news: 900, compositeIndex: 70 },
    { time: '2023', papers: 3200, funding: 2500, social: 12000, news: 2100, compositeIndex: 85 },
    { time: '2024', papers: 4500, funding: 4200, social: 28000, news: 4500, compositeIndex: 95 },
  ],
  China: [
    { time: '2020', papers: 500, funding: 200, social: 800, news: 150, compositeIndex: 30 },
    { time: '2021', papers: 800, funding: 350, social: 1800, news: 380, compositeIndex: 45 },
    { time: '2022', papers: 1400, funding: 700, social: 3500, news: 850, compositeIndex: 60 },
    { time: '2023', papers: 3000, funding: 1800, social: 9000, news: 1900, compositeIndex: 82 },
    { year: 2024, papers: 4600, funding: 3800, social: 22000, news: 4200, compositeIndex: 94 },
  ],
  EU: [
    { time: '2020', papers: 400, funding: 150, social: 600, news: 100, compositeIndex: 25 },
    { time: '2021', papers: 600, funding: 250, social: 1200, news: 250, compositeIndex: 35 },
    { time: '2022', papers: 900, funding: 500, social: 2500, news: 600, compositeIndex: 50 },
    { time: '2023', papers: 1800, funding: 1200, social: 6000, news: 1200, compositeIndex: 70 },
    { time: '2024', papers: 2800, funding: 2200, social: 15000, news: 3100, compositeIndex: 85 },
  ]
};

// --- Specific Data Injection for Funding Trend ---
const FUNDING_OVERRIDES = [
  { val: 2.6, name: 'Agency AI' },
  { val: 4, name: 'AutonomyAI' },
  { val: 1.3, name: 'Target AI' },
  { val: 9.8, name: 'Natural' },
  { val: 25, name: 'LangChain' },
  { val: 15, name: 'Duvo.ai' },
  { val: 25, name: 'Artisan AI' },
  { val: 75, name: 'Manus' },
  { val: 8.7, name: 'AgentSmyth' },
  { val: 400, name: 'Cognition Labs' }
];

const generateMonthlyTrend = () => {
  const data: TrendData[] = [];
  const baseDate = new Date();
  // Align dates so the last point is current month, spanning exactly 10 points
  baseDate.setMonth(baseDate.getMonth() - 9);

  FUNDING_OVERRIDES.forEach((item, i) => {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const timeStr = `${year}-${month.toString().padStart(2, '0')}`;
    
    // Generate organic-looking data for other metrics
    // We create an exponential growth curve for papers to make the chart look realistic
    const growthFactor = Math.pow(1.12, i);
    const papers = Math.round(1500 * growthFactor + Math.random() * 300);
    const citations = Math.round(5000 * Math.pow(1.15, i) + Math.random() * 1000);
    const social = Math.round(papers * 3 + Math.random() * 500);

    data.push({
      time: timeStr,
      papers: papers,
      paperGrowth: '+' + Math.round(15 + Math.random() * 10) + '%',
      citations: citations,
      social: social,
      news: Math.round(papers * 0.4 + Math.random() * 50),
      funding: item.val,
      // Composite index derivation: Scaled and offset to ensure > 20,000
      compositeIndex: Math.round(20000 + (papers * 6) + (citations * 0.6) + (item.val * 30) + (i * 1500) + Math.random() * 1000),
      fundingEvents: [{
        year: year,
        company: item.name,
        amount: `$${item.val}M`,
        investor: 'Strategic Capital',
        logo: item.name.charAt(0)
      }]
    });
  });

  return data;
};

export const TREND_MOCK: TrendData[] = generateMonthlyTrend();

export const PAPERS_MOCK: Paper[] = [
  { 
    id: 'p1', 
    title: 'ModelScope-Agent: Building Your Customizable Agent System with Open-source Large Language Models', 
    url: 'https://arxiv.org/abs/2309.00986?utm_source=chatgpt.com',
    year: 2023, 
    citations: 1200, 
    hotness: 563, 
    awards: ['Agent Innovation'], 
    trend: [10, 30, 60, 95], 
    authors: ['ModelScope Team'], 
    tags: ['Agent', 'Open Source'], 
    venue: 'ArXiv',
    abstract: 'We present ModelScope-Agent, a general-purpose agent system capable of planning and executing tasks using diverse toolsets.'
  },
  { 
    id: 'p2', 
    title: 'Cognitive Kernel-Pro: A Framework for Deep Research Agents and Agent Foundation Models Training', 
    url: 'https://arxiv.org/abs/2508.00414?utm_source=chatgpt.com',
    year: 2024, 
    citations: 450, 
    hotness: 199, 
    awards: ['Best New Framework'], 
    trend: [0, 20, 50, 98], 
    authors: ['Research AI Labs'], 
    tags: ['Cognitive AI', 'Foundation Models'], 
    venue: 'NeurIPS 2024',
    abstract: 'This paper introduces Cognitive Kernel-Pro, focusing on the specialized training of research-oriented agent foundation models.'
  },
  { 
    id: 'p3', 
    title: 'EnvX: Agentize Everything with Agentic AI', 
    url: 'https://arxiv.org/abs/2509.08088?utm_source=chatgpt.com',
    year: 2024, 
    citations: 180, 
    hotness: 92, 
    awards: ['Fast Rising'], 
    trend: [0, 5, 40, 92], 
    authors: ['EnvX Labs'], 
    tags: ['Agentic AI', 'Infrastructure'], 
    venue: 'ICLR 2024',
    abstract: 'EnvX provides a unified environment abstraction to enable seamless agent integration across legacy and modern software ecosystems.'
  },
  { 
    id: 'p4', 
    title: 'OAgents: An Empirical Study of Building Effective Agents', 
    url: 'https://arxiv.org/abs/2506.15741?utm_source=chatgpt.com',
    year: 2024, 
    citations: 320, 
    hotness: 115, 
    awards: ['Empirical Study Award'], 
    trend: [5, 15, 45, 88], 
    authors: ['OAgents Research Group'], 
    tags: ['Agent Architecture', 'Efficiency'], 
    venue: 'ArXiv',
    abstract: 'An empirical investigation into building robust and efficient AI agents across various complexity tiers.'
  },
  { 
    id: 'p5', 
    title: 'Agentic AI: a comprehensive survey of architectures, applications, and future directions (Artificial Intelligence Review 2025)', 
    url: 'https://link.springer.com/article/10.1007/s10462-025-11422-4?utm_source=chatgpt.com',
    year: 2025, 
    citations: 580, 
    hotness: 240, 
    awards: ['State of the Art Survey'], 
    trend: [20, 50, 80, 99], 
    authors: ['AI Review Board'], 
    tags: ['Agentic AI', 'Survey'], 
    venue: 'Artificial Intelligence Review',
    abstract: 'A comprehensive longitudinal survey of the current state and future trajectories of Agentic AI systems.'
  },
  ...Array.from({ length: 25 }).map((_, i) => ({
    id: `p-mock-${i}`,
    title: `Breakthrough Research Paper #${i + 6}: Analysis of Latent Space Optimization`,
    year: 2020 + (i % 5),
    citations: 500 + (i * 120),
    hotness: 60 + (i % 38),
    awards: i % 5 === 0 ? ['Best Paper Candidate'] : [],
    trend: [10, 20, 30, 50, 70],
    authors: [`Author ${i}A`, `Author ${i}B`],
    tags: i % 2 === 0 ? ['Deep Learning'] : ['Computer Vision'],
    venue: i % 2 === 0 ? 'ICML' : 'CVPR',
    abstract: 'This research explores high-dimensional manifold alignment in generative models, providing a novel framework for cross-domain latent space mapping and interpretability.'
  }))
];

export const SOCIAL_POSTS_MOCK: SocialPost[] = [
  { 
    id: 'sp1', 
    platform: 'Reddit', 
    user: 'DailyTechBytes', 
    avatar: 'DB', 
    content: 'Clawbot Renamed to Moltbot', 
    sentiment: 'neutral',
    url: 'https://www.reddit.com/r/DailyTechBytes/comments/1qp3x28/clawbot_renamed_to_moltbot/'
  },
  { 
    id: 'sp2', 
    platform: 'Reddit', 
    user: 'LocalLLM', 
    avatar: 'LM', 
    content: 'Has anyone gotten Clawdbot/Moltbot working with a local model via Ollama or LM Studio?', 
    sentiment: 'neutral',
    url: 'https://www.reddit.com/r/LocalLLM/comments/1qoycxf/has_anyone_gotten_clawdbotmoltbot_working_with_a/'
  },
  { 
    id: 'sp3', 
    platform: 'Reddit', 
    user: 'SideProject', 
    avatar: 'SP', 
    content: 'Built an explainer for Moltbot (the open-source AI agent) - would love feedback', 
    sentiment: 'positive',
    url: 'https://www.reddit.com/r/SideProject/comments/1qoz4u7/built_an_explainer_for_moltbot_the_opensource_ai/'
  },
];

export const FIELD_INFLUENCE_DATA = [
  { subject: 'Natural Language', A: 120, fullMark: 150 },
  { subject: 'Computer Vision', A: 98, fullMark: 150 },
  { subject: 'Robotics', A: 86, fullMark: 150 },
  { subject: 'Reinforcement Learning', A: 99, fullMark: 150 },
  { subject: 'Generative AI', A: 145, fullMark: 150 },
  { subject: 'Hardware/Compute', A: 130, fullMark: 150 },
];
