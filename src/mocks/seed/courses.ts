// Proposed demo learning content for the WEPs portal mockup. Courses, lessons and quizzes
// are illustrative and labelled as proposed content in the UI; they are not official
// UN Women curricula.

import type { Course, LearningPath, Lesson, QuizQuestion } from '@shared/types'
import { images } from '@/config/images'

const quizLesson = (
  courseId: string,
  title: string,
  summary: string,
  questions: Omit<QuizQuestion, 'id'>[],
): Lesson => ({
  id: `${courseId}-quiz`,
  title,
  type: 'quiz',
  minutes: questions.length >= 5 ? 10 : 8,
  summary,
  body: [
    'This short knowledge check confirms the main ideas from the course before you apply them in your own role.',
    'Answer every question, then review the explanation for each item. The pass mark is 70 percent and you can retake the quiz as many times as you need.',
    'Passing the quiz marks the course as complete. For designated pathway courses, it also counts towards the qualifying points needed to join the related clinic.',
  ],
  keyPoints: [
    'Pass mark is 70 percent.',
    'Explanations are shown after you submit.',
    'Retakes are unlimited.',
  ],
  quiz: questions.map((q, i) => ({ ...q, id: `${courseId}-q${i + 1}` })),
})

/* ------------------------------------------------------------------ HR -- */

const inclusiveRecruitment: Course = {
  id: 'crs-inclusive-recruitment',
  slug: 'inclusive-recruitment',
  title: 'Inclusive Recruitment in Practice',
  objective:
    'Design a hiring process that widens the candidate pool and reduces bias at every stage.',
  description:
    'A practical course for HR teams and hiring managers on writing inclusive job adverts, structuring interviews and making evidence-based hiring decisions. It closes with a checklist you can apply to your next vacancy.',
  outcomes: [
    'Rewrite a job advert to remove gender-coded language and unnecessary requirements.',
    'Run a structured interview with consistent questions and a shared scoring guide.',
    'Track applicant and shortlist data by gender to spot where candidates drop out.',
    'Agree a balanced shortlist and diverse panel standard with hiring managers.',
  ],
  image: images.courses.inclusiveRecruitment.src,
  departments: ['hr', 'operations'],
  principle: 2,
  topic: 'Recruitment',
  language: 'English',
  designated: true,
  relatedEventId: 'evt-inclusive-recruitment-clinic',
  audience: 'employee',
  published: true,
  lessons: [
    {
      id: 'crs-inclusive-recruitment-l1',
      title: 'Why inclusive recruitment matters',
      type: 'video',
      minutes: 8,
      summary:
        'How small decisions early in hiring shape who applies, who is shortlisted and who is hired.',
      body: [
        'Recruitment is where many gender gaps begin. Research on job advertising consistently shows that women are less likely than men to apply for roles unless they meet nearly every listed requirement, so long wish-lists of qualifications quietly narrow the pool before a single CV is read.',
        'Bias also enters through informal practices: referrals from existing networks, unstructured interviews that reward confidence over competence, and decisions made on “culture fit”. Each step looks neutral on its own, but together they produce shortlists that mirror the current workforce.',
        'The good news is that inclusive recruitment is mostly about consistency. When every candidate meets the same criteria, the same questions and the same scoring guide, hiring becomes fairer, faster and easier to defend. The rest of this course shows you how to build that consistency into your own process.',
      ],
      keyPoints: [
        'Gaps often start at the advert and sourcing stage, not the interview.',
        'Informal practices such as referrals and “culture fit” reproduce the current workforce.',
        'Consistency in criteria, questions and scoring is the core of fair hiring.',
      ],
      transcript:
        'Welcome to Inclusive Recruitment in Practice. In this first lesson we look at the hiring funnel as a whole. Think about your last vacancy. Who saw the advert? Who applied? Who was shortlisted and who was hired? At each step, some candidates leave the process. When we look at that data by gender, we often find that women drop out at specific points: they apply less to adverts with long requirement lists, and they are shortlisted less when criteria are vague. In the next lessons we will fix each of these points with simple, repeatable practices: clearer adverts, structured interviews and better data.',
    },
    {
      id: 'crs-inclusive-recruitment-l2',
      title: 'Writing job adverts that widen the pool',
      type: 'reading',
      minutes: 10,
      summary:
        'Practical techniques for adverts that attract a broader, more diverse set of qualified candidates.',
      body: [
        'Start by separating essential requirements from desirable ones. Limit essentials to the four or five capabilities a person genuinely needs on day one, and describe them as outcomes rather than years of experience. “Can manage a supplier budget of USD 2 million” is more useful than “10+ years in procurement”.',
        'Review the language. Words such as “dominant”, “aggressive” or “rockstar” tend to read as masculine-coded, while overly passive language can undersell the role. Aim for clear, neutral descriptions of the work, and state flexible working options, parental leave and pay range up front, because these are among the factors candidates weigh most.',
        'Finally, think about where the advert appears. Post beyond your usual channels: women’s professional networks, university alumni groups, return-to-work programmes and regional job boards. Record which channels produce applicants so you can invest in those that broaden your pool.',
      ],
      keyPoints: [
        'Keep essential requirements short and outcome-based.',
        'Use neutral language and publish pay range and flexibility options.',
        'Advertise through channels that reach under-represented candidates and track results.',
      ],
    },
    {
      id: 'crs-inclusive-recruitment-l3',
      title: 'Structured interviews and diverse panels',
      type: 'reading',
      minutes: 12,
      summary: 'How to run interviews that assess every candidate against the same evidence.',
      body: [
        'A structured interview uses the same set of questions, in the same order, for every candidate, with a scoring guide agreed before interviews begin. Each question links to a competency in the job description, and each score is supported by a short written note on what the candidate actually said.',
        'Panels should include at least two people, and wherever possible, people of different genders and backgrounds. Panel members score independently before discussing, which prevents the most senior or most vocal person from anchoring the outcome. A short calibration conversation then resolves differences using the evidence recorded.',
        'Avoid questions about family plans, marital status or availability that are not asked of everyone and are not job-related. If flexibility is relevant, describe the role’s working pattern and ask whether the candidate can meet it. Keep interview notes for the period required by local law so decisions can be reviewed if challenged.',
      ],
      keyPoints: [
        'Same questions, same order, pre-agreed scoring guide.',
        'Mixed panels score independently before calibrating together.',
        'Never ask about family plans or personal circumstances.',
      ],
    },
    {
      id: 'crs-inclusive-recruitment-l4',
      title: 'Applying it to your next vacancy',
      type: 'reflection',
      minutes: 10,
      summary: 'Plan the concrete changes you will make to a live or upcoming vacancy.',
      body: [
        'Choose one vacancy that is open now or will open in the next quarter. Walk through each stage — advert, sourcing, screening, interview and offer — and note what currently happens and who makes each decision.',
        'For each stage, identify one change from this course you could make without new budget. Typical first steps are shortening the essential requirements, adding the pay range, agreeing a balanced shortlist target and introducing a shared scoring guide.',
        'Decide how you will measure the effect. At minimum, record the number of applicants, shortlisted candidates and offers by gender for this vacancy, and compare them with a similar role filled last year. Bring your plan to the Inclusive Recruitment Clinic to test it with peers.',
      ],
      keyPoints: [
        'Map one real vacancy stage by stage.',
        'Pick one no-cost change per stage.',
        'Measure applicants, shortlist and offers by gender.',
      ],
      reflectionPrompt:
        'Which vacancy will you apply this to, what are the two changes you will make first, and how will you know whether they worked?',
    },
    quizLesson(
      'crs-inclusive-recruitment',
      'Inclusive recruitment quiz',
      'Check your understanding of inclusive advertising, interviewing and data tracking.',
      [
        {
          text: 'Which change to a job advert is most likely to increase applications from qualified women?',
          options: [
            'Adding more desirable qualifications to signal seniority',
            'Limiting essential requirements to the core capabilities needed for the role',
            'Removing the salary information to encourage negotiation',
            'Describing the team culture as fast-paced and competitive',
          ],
          correctIndex: 1,
          explanation:
            'Candidates, especially women, often self-select out when they do not meet every listed requirement. A short list of genuine essentials widens the pool.',
        },
        {
          text: 'What defines a structured interview?',
          options: [
            'The interviewer adapts questions to each candidate’s CV',
            'Only one senior interviewer makes the decision',
            'Every candidate receives the same questions, scored against a pre-agreed guide',
            'Candidates complete a personality test before the interview',
          ],
          correctIndex: 2,
          explanation:
            'Consistency of questions and scoring is what makes an interview structured and comparable across candidates.',
        },
        {
          text: 'Why should panel members score candidates independently before discussing?',
          options: [
            'To prevent the most senior or vocal member from anchoring the decision',
            'To shorten the interview process',
            'Because discussion between panel members is not permitted',
            'So that HR can override the panel',
          ],
          correctIndex: 0,
          explanation:
            'Independent scoring captures each person’s evidence-based view first; calibration then resolves differences on the evidence.',
        },
        {
          text: 'Which interview question should be avoided?',
          options: [
            'Tell us about a time you resolved a supplier dispute.',
            'Do you plan to start a family in the next few years?',
            'How would you prioritise three competing deadlines?',
            'This role requires travel twice a month. Can you meet that requirement?',
          ],
          correctIndex: 1,
          explanation:
            'Questions about family plans are not job-related, are not asked equally of all candidates and can be discriminatory.',
        },
        {
          text: 'What is the minimum data to track to see where women drop out of your hiring process?',
          options: [
            'Total number of hires per year',
            'Time to hire for each vacancy',
            'Applicants, shortlisted candidates and offers by gender',
            'Candidate satisfaction scores',
          ],
          correctIndex: 2,
          explanation:
            'Comparing the gender split at each stage of the funnel shows exactly where candidates are lost.',
        },
      ],
    ),
  ],
}

const fairProgressionPay: Course = {
  id: 'crs-fair-progression-pay',
  slug: 'fair-progression-pay',
  title: 'Fair Progression and Equal Pay',
  objective:
    'Understand how to identify and close gaps in pay and promotion between women and men.',
  description:
    'This course explains the difference between equal pay and the gender pay gap, how to run a basic pay review and how to make promotion decisions more transparent. It is designed for HR teams and people managers.',
  outcomes: [
    'Explain the difference between equal pay for equal work and the gender pay gap.',
    'Prepare a basic pay gap calculation using median hourly pay.',
    'Introduce transparent promotion criteria and calibration.',
  ],
  image: images.courses.fairProgressionPay.src,
  departments: ['hr', 'leadership', 'operations'],
  principle: 2,
  topic: 'Pay equity',
  language: 'English',
  audience: 'all',
  published: true,
  lessons: [
    {
      id: 'crs-fair-progression-pay-l1',
      title: 'Equal pay and the gender pay gap',
      type: 'video',
      minutes: 9,
      summary: 'Two related but different measures, and why companies need to track both.',
      body: [
        'Equal pay means women and men doing the same work, or work of equal value, receive the same pay. It is a legal requirement in most countries and is tested by comparing individuals in comparable roles.',
        'The gender pay gap is different. It compares the average or median pay of all women with all men in the organisation, regardless of role. A company can pay equally for equal work and still have a large gap if women are concentrated in lower-paid roles and under-represented in senior ones.',
        'Tracking both matters. Equal pay findings point to individual corrections, while the pay gap points to structural issues in recruitment, progression and job design. Together they tell leadership where to act.',
      ],
      keyPoints: [
        'Equal pay compares like-for-like roles.',
        'The pay gap compares all women and all men across the organisation.',
        'A pay gap usually reflects representation at different levels.',
      ],
      transcript:
        'In this lesson we separate two ideas that are often confused. Equal pay asks: is this woman paid the same as this man for the same job? The gender pay gap asks: across the whole company, how does the median woman’s hourly pay compare with the median man’s? You need both answers. If you only fix individual cases, the structural gap may remain because women are still clustered in lower-paid roles.',
    },
    {
      id: 'crs-fair-progression-pay-l2',
      title: 'Running a basic pay review',
      type: 'reading',
      minutes: 12,
      summary:
        'A step-by-step approach to calculating your median gender pay gap and investigating causes.',
      body: [
        'Begin with clean data: hourly base pay, bonus, grade, function, location, contract type and gender for every employee in the reporting period. Convert all pay to an hourly figure so that part-time and full-time employees can be compared fairly.',
        'Calculate the median hourly pay for women and for men, then express the difference as a percentage of men’s median pay. Repeat the calculation within each grade and job family. Gaps within the same grade warrant individual review; gaps that disappear within grades point to representation issues.',
        'Document what you find, what explains each gap and what you will do about it. Agree a budget for corrections where unexplained differences exist, and set a date to rerun the analysis. Report the headline figure to leadership along with the actions.',
      ],
      keyPoints: [
        'Convert pay to hourly to compare part-time and full-time staff.',
        'Calculate the median gap overall and within each grade.',
        'Document causes, corrections and a review date.',
      ],
    },
    {
      id: 'crs-fair-progression-pay-l3',
      title: 'Transparent promotion decisions',
      type: 'reflection',
      minutes: 10,
      summary:
        'Reduce bias in promotions through clear criteria, open opportunities and calibration.',
      body: [
        'Promotions are often decided through informal sponsorship, which favours people who are already visible to senior leaders. Publishing the criteria for each level and advertising internal opportunities openly gives everyone the same information.',
        'Calibration meetings, where managers review promotion and performance ratings together against shared criteria, help catch inconsistencies. Ask for evidence behind each recommendation and look at outcomes by gender before decisions are final.',
        'Watch for patterns such as women receiving positive reviews but fewer stretch assignments, or employees returning from parental leave being overlooked. Small process checks at the right moment can prevent these patterns from compounding over a career.',
      ],
      keyPoints: [
        'Publish promotion criteria and advertise internal roles.',
        'Calibrate ratings and review outcomes by gender before finalising.',
        'Check access to stretch assignments and post-leave progression.',
      ],
      reflectionPrompt:
        'Think about the last promotion round in your team. Were the criteria visible to everyone, and what would you check by gender before the next round?',
    },
    quizLesson(
      'crs-fair-progression-pay',
      'Fair progression and pay quiz',
      'Check your understanding of pay equity and promotion practice.',
      [
        {
          text: 'A company pays women and men equally in every role but has a 15 percent median pay gap. What is the most likely explanation?',
          options: [
            'The calculation is wrong',
            'Women are under-represented in higher-paid roles',
            'Men work more hours',
            'Bonuses are excluded',
          ],
          correctIndex: 1,
          explanation:
            'When equal pay is in place, a pay gap usually reflects the distribution of women and men across pay levels.',
        },
        {
          text: 'Why convert pay to an hourly figure before calculating the gap?',
          options: [
            'It is required for tax reporting',
            'It makes the numbers smaller',
            'It allows fair comparison between part-time and full-time employees',
            'It removes bonuses from the calculation',
          ],
          correctIndex: 2,
          explanation:
            'Hourly pay removes the effect of different working hours, which disproportionately affects women working part-time.',
        },
        {
          text: 'What does a gap within the same grade and job family suggest?',
          options: [
            'Individual pay decisions may need review',
            'The grading structure is too detailed',
            'Representation is the only issue',
            'No action is needed',
          ],
          correctIndex: 0,
          explanation:
            'Differences between people at the same grade in the same job family should be explained by legitimate factors or corrected.',
        },
        {
          text: 'Which practice most improves the fairness of promotions?',
          options: [
            'Letting senior leaders nominate candidates informally',
            'Publishing criteria and calibrating decisions against them',
            'Promoting based on length of service only',
            'Keeping promotion decisions confidential until announced',
          ],
          correctIndex: 1,
          explanation:
            'Clear criteria and calibration give everyone the same information and test decisions for consistency.',
        },
      ],
    ),
  ],
}

const workplaceWellbeing: Course = {
  id: 'crs-workplace-wellbeing',
  slug: 'workplace-wellbeing',
  title: 'Health, Wellbeing and Safety at Work',
  objective: 'Build a workplace where all employees are safe, supported and free from harassment.',
  description:
    'Covers the essentials of preventing and responding to sexual harassment, supporting employees through caregiving and life events, and designing safe working conditions. Suitable for HR, operations managers and team leaders.',
  outcomes: [
    'Describe the core elements of an effective anti-harassment policy and reporting channel.',
    'Respond appropriately when an employee discloses harassment.',
    'Identify wellbeing and safety needs that affect women differently.',
  ],
  image: images.courses.workplaceWellbeing.src,
  departments: ['hr', 'operations'],
  principle: 3,
  topic: 'Wellbeing and safety',
  language: 'English',
  audience: 'all',
  published: true,
  lessons: [
    {
      id: 'crs-workplace-wellbeing-l1',
      title: 'Preventing sexual harassment',
      type: 'reading',
      minutes: 12,
      summary: 'The building blocks of a zero-tolerance approach that employees trust.',
      body: [
        'An effective policy defines harassment clearly with examples, applies to everyone including contractors and visitors, and covers work-related settings such as travel, events and online channels. It states that retaliation against anyone who reports is itself a serious offence.',
        'Reporting channels must be accessible and trusted. Offer more than one route — a line manager, HR, a designated contact of a different gender and an anonymous or third-party option — so that nobody has to report to the person involved.',
        'Prevention also depends on training and leadership signals. Managers need to know how to recognise and stop inappropriate behaviour, and leaders should speak openly about the policy. Review the number and outcome of reports each year; a low number may indicate low trust rather than low incidence.',
      ],
      keyPoints: [
        'Define harassment clearly and cover all work-related settings.',
        'Offer multiple reporting channels, including an anonymous option.',
        'Low report numbers can signal low trust, not low incidence.',
      ],
    },
    {
      id: 'crs-workplace-wellbeing-l2',
      title: 'Responding to a disclosure',
      type: 'video',
      minutes: 9,
      summary: 'What to say and do when a colleague tells you they have experienced harassment.',
      body: [
        'When someone discloses harassment, listen without interrupting, thank them for telling you and avoid questions that suggest blame. Your first job is to make sure they are safe and know what options exist.',
        'Explain confidentiality honestly: you will protect their information as far as possible, but some situations require escalation. Tell them which reporting route the policy sets out and offer to help them use it. Do not investigate yourself.',
        'Record the facts of the conversation accurately and store them securely. Follow up to check on their wellbeing and make sure they are not experiencing retaliation. Point them to support such as employee assistance programmes or specialist services.',
      ],
      keyPoints: [
        'Listen, believe and avoid blame.',
        'Be honest about confidentiality and escalation.',
        'Record, refer and follow up — do not investigate yourself.',
      ],
      transcript:
        'This lesson is about one of the hardest conversations a manager can have. If a colleague tells you they have been harassed, the first minutes matter. Listen. Thank them. Do not ask why they did not report earlier or what they were wearing. Explain what will happen next and what you are obliged to do. Then help them use the formal channel and keep checking in.',
    },
    {
      id: 'crs-workplace-wellbeing-l3',
      title: 'Wellbeing needs across life stages',
      type: 'reflection',
      minutes: 8,
      summary:
        'Recognise how caregiving, pregnancy, menopause and safety concerns affect experience at work.',
      body: [
        'Women still carry a larger share of unpaid care in most countries. Flexible scheduling, predictable shifts and support for childcare or eldercare can decide whether someone stays in work or leaves.',
        'Physical safety also differs by role and location: safe transport for late shifts, well-lit facilities, appropriately fitting protective equipment and private spaces for breastfeeding are practical measures with a large effect.',
        'Health policies should cover pregnancy, return from parental leave and menopause. Ask employees what would help through confidential surveys, and review the results by gender and role so that support reaches those who need it.',
      ],
      keyPoints: [
        'Caregiving support and predictable schedules aid retention.',
        'Physical safety measures must fit the realities of each role.',
        'Ask employees confidentially and analyse results by gender.',
      ],
      reflectionPrompt:
        'Which wellbeing or safety measure would make the biggest difference to women in your team or site, and who would you need to involve to introduce it?',
    },
    quizLesson(
      'crs-workplace-wellbeing',
      'Wellbeing and safety quiz',
      'Check your understanding of harassment prevention and wellbeing support.',
      [
        {
          text: 'Why should a harassment policy offer more than one reporting channel?',
          options: [
            'To increase the number of investigations',
            'So nobody has to report to the person involved in the complaint',
            'Because it is cheaper',
            'To share the workload across HR',
          ],
          correctIndex: 1,
          explanation:
            'Multiple routes, including anonymous ones, ensure every employee has a safe and trusted way to report.',
        },
        {
          text: 'A manager receives a disclosure. What should they avoid doing?',
          options: [
            'Explaining the reporting options',
            'Recording the facts of the conversation',
            'Conducting their own investigation',
            'Following up on the colleague’s wellbeing',
          ],
          correctIndex: 2,
          explanation:
            'Investigations should be handled through the formal process by trained people, not by the manager receiving the disclosure.',
        },
        {
          text: 'A site reports zero harassment complaints for three years. What is the best interpretation?',
          options: [
            'Harassment does not occur at the site',
            'Employees may not trust the reporting process',
            'The policy can be withdrawn',
            'The site needs no training',
          ],
          correctIndex: 1,
          explanation:
            'Very low reporting often reflects low trust or awareness; it should prompt a check on channels and culture.',
        },
        {
          text: 'Which measure most directly supports women working late shifts?',
          options: [
            'An annual wellbeing newsletter',
            'Safe transport options and well-lit facilities',
            'Longer lunch breaks',
            'A dress code',
          ],
          correctIndex: 1,
          explanation:
            'Practical safety measures such as transport and lighting address the specific risks of late shifts.',
        },
      ],
    ),
  ],
}

/* ------------------------------------------------------------------ Procurement -- */

const genderResponsiveProcurement: Course = {
  id: 'crs-gender-responsive-procurement',
  slug: 'gender-responsive-procurement',
  title: 'Gender-responsive Procurement Essentials',
  objective:
    'Use purchasing decisions to expand opportunities for women-owned businesses and improve supplier practices.',
  description:
    'An introduction to gender-responsive procurement for buyers and category managers. You will learn how to baseline spend with women-owned businesses, remove barriers in sourcing and include gender criteria in tenders.',
  outcomes: [
    'Define a women-owned business and explain how to verify it.',
    'Baseline current spend with women-owned suppliers.',
    'Identify and remove common barriers in sourcing processes.',
    'Include proportionate gender criteria in tenders and supplier codes.',
  ],
  image: images.courses.genderResponsiveProcurement.src,
  departments: ['procurement'],
  principle: 5,
  topic: 'Procurement',
  language: 'English',
  designated: true,
  relatedEventId: 'evt-procurement-clinic',
  audience: 'employee',
  published: true,
  lessons: [
    {
      id: 'crs-gender-responsive-procurement-l1',
      title: 'What gender-responsive procurement means',
      type: 'video',
      minutes: 8,
      summary: 'An overview of how procurement can advance gender equality across the value chain.',
      body: [
        'Gender-responsive procurement is the selection of services, goods or civil works that considers their impact on gender equality and women’s empowerment. In practice it covers two areas: buying more from women-owned businesses, and encouraging all suppliers to adopt gender-equal practices.',
        'Women-owned businesses receive a very small share of corporate and government procurement spend globally. Barriers include limited access to tender information, large contract sizes, long payment terms and complex registration requirements that disproportionately affect small firms.',
        'Procurement teams are well placed to change this because they control the processes. Small adjustments — splitting large lots, shortening payment terms, simplifying pre-qualification — can widen the pool without compromising value for money or quality.',
      ],
      keyPoints: [
        'Two levers: spend with women-owned businesses and supplier practices.',
        'Barriers are often procedural rather than about capability.',
        'Process changes can widen competition while protecting value for money.',
      ],
      transcript:
        'Welcome to Gender-responsive Procurement Essentials. Every purchase order is a decision about who benefits from your company’s spend. In this course we look at that decision through a gender lens. First, how much do you currently buy from women-owned businesses? Second, what in your process makes it harder for them to compete? And third, how can you encourage all suppliers to treat women fairly? Let us start with the definitions and the evidence.',
    },
    {
      id: 'crs-gender-responsive-procurement-l2',
      title: 'Baselining spend with women-owned businesses',
      type: 'reading',
      minutes: 12,
      summary: 'How to define, verify and measure your current spend with women-owned suppliers.',
      body: [
        'A commonly used definition of a women-owned business is one that is at least 51 percent unconditionally owned by one or more women, with women controlling management and daily operations. Third-party certification bodies can verify this; self-declaration is a reasonable starting point while certification is being encouraged.',
        'To build a baseline, add an ownership field to your supplier master data and ask existing suppliers to declare their status, ideally through a short survey sent with routine supplier updates. Match responses against spend data for the last full financial year.',
        'Report the result as a percentage of addressable spend — the categories where you have genuine choice of supplier — rather than total spend, which includes utilities and other fixed costs. This gives a realistic picture and a fair basis for targets.',
      ],
      keyPoints: [
        'Use the 51 percent ownership and control definition.',
        'Add ownership to supplier master data and survey existing suppliers.',
        'Measure against addressable spend for a realistic baseline.',
      ],
    },
    {
      id: 'crs-gender-responsive-procurement-l3',
      title: 'Removing barriers and setting tender criteria',
      type: 'reading',
      minutes: 13,
      summary:
        'Practical changes to sourcing processes and how to add proportionate gender criteria.',
      body: [
        'Review your sourcing process from the supplier’s side. Where are opportunities advertised? How long does registration take? What financial thresholds, insurance levels or past-contract requirements apply, and are they proportionate to the contract value? Splitting large contracts into lots and accepting smaller insurance levels for low-risk work are common fixes.',
        'Payment terms matter greatly to small firms. Committing to pay small and women-owned suppliers within 30 days, or offering supply chain finance, can be the difference between a business bidding or not.',
        'In tenders, you can include proportionate criteria such as the supplier’s own gender policies, women’s representation in the workforce delivering the contract, or a commitment to subcontract with women-owned businesses. Weight these criteria modestly, explain how they will be scored and make sure they are relevant to the contract.',
      ],
      keyPoints: [
        'Make thresholds proportionate and split large lots where possible.',
        'Shorter payment terms remove a major barrier for small firms.',
        'Add relevant, transparently scored gender criteria to tenders.',
      ],
    },
    {
      id: 'crs-gender-responsive-procurement-l4',
      title: 'Planning your first category action',
      type: 'reflection',
      minutes: 10,
      summary: 'Choose one category and plan a realistic first step.',
      body: [
        'Choose one category where you have genuine choice of supplier and a renewal or tender coming up in the next six months. Facilities services, catering, marketing services, events and professional services are often good starting points.',
        'Identify the barrier most likely to keep women-owned businesses out of that category and the change you can make, such as a lot split, outreach through a women’s business association or a simplified pre-qualification questionnaire.',
        'Set a measurable target for the category, agree it with your manager and the budget holder, and decide how you will record results. Bring your plan to the Procurement Clinic to test it with peers and trainers.',
      ],
      keyPoints: [
        'Start with one category with an upcoming renewal.',
        'Address the single biggest barrier first.',
        'Agree a measurable target with the budget holder.',
      ],
      reflectionPrompt:
        'Which category will you start with, what is the main barrier for women-owned suppliers in it, and what target will you propose?',
    },
    quizLesson(
      'crs-gender-responsive-procurement',
      'Gender-responsive procurement quiz',
      'Check your understanding of definitions, baselining and sourcing practice.',
      [
        {
          text: 'Which is a commonly used definition of a women-owned business?',
          options: [
            'A business with a woman CEO',
            'A business at least 51 percent owned, managed and controlled by women',
            'A business with more than half female employees',
            'Any business that sells to women',
          ],
          correctIndex: 1,
          explanation:
            'The common definition combines at least 51 percent ownership with control of management and operations.',
        },
        {
          text: 'Why measure spend with women-owned businesses against addressable spend?',
          options: [
            'It produces a higher percentage',
            'It excludes fixed costs where you have no supplier choice, giving a realistic baseline',
            'It is required by law',
            'It only counts certified suppliers',
          ],
          correctIndex: 1,
          explanation:
            'Addressable spend focuses on categories you can influence, so targets are fair and meaningful.',
        },
        {
          text: 'Which change most directly helps small women-owned suppliers compete?',
          options: [
            'Raising insurance requirements for all contracts',
            'Extending payment terms to 120 days',
            'Splitting large contracts into smaller lots',
            'Advertising tenders only to existing suppliers',
          ],
          correctIndex: 2,
          explanation: 'Smaller lots match the capacity of smaller firms and widen competition.',
        },
        {
          text: 'What makes a gender criterion in a tender appropriate?',
          options: [
            'It carries most of the total score',
            'It is relevant to the contract, proportionate and transparently scored',
            'It is only disclosed after bids are received',
            'It requires all suppliers to be women-owned',
          ],
          correctIndex: 1,
          explanation:
            'Criteria should be relevant, proportionate and clearly explained so suppliers know how they will be assessed.',
        },
        {
          text: 'What is a sensible first step for a procurement team new to this topic?',
          options: [
            'Replace all current suppliers',
            'Set a target of 50 percent spend in the first year',
            'Pick one category with an upcoming renewal and address its main barrier',
            'Wait until a company-wide policy is approved',
          ],
          correctIndex: 2,
          explanation: 'Starting with one category builds evidence and confidence before scaling.',
        },
      ],
    ),
  ],
}

const supplierEngagement: Course = {
  id: 'crs-supplier-engagement',
  slug: 'supplier-engagement',
  title: 'Engaging Suppliers on Gender Equality',
  objective:
    'Encourage suppliers to adopt gender-equal workplace practices through codes, dialogue and support.',
  description:
    'Moves beyond spend to look at how buyers can influence supplier practices. Covers supplier codes of conduct, assessment questions, capacity building and handling non-compliance constructively.',
  outcomes: [
    'Add gender equality expectations to a supplier code of conduct.',
    'Use proportionate questions to understand supplier practices.',
    'Plan supportive engagement with suppliers that need to improve.',
  ],
  image: images.courses.supplierEngagement.src,
  departments: ['procurement', 'sustainability'],
  principle: 5,
  topic: 'Supplier engagement',
  language: 'English',
  prerequisiteCourseId: 'crs-gender-responsive-procurement',
  audience: 'employee',
  published: true,
  lessons: [
    {
      id: 'crs-supplier-engagement-l1',
      title: 'Setting expectations in your supplier code',
      type: 'reading',
      minutes: 10,
      summary: 'What a supplier code should say about gender equality and how to introduce it.',
      body: [
        'Most supplier codes already cover non-discrimination, but few are specific about gender. Useful additions include equal pay for work of equal value, freedom from sexual harassment, maternity protection, safe working conditions for women and access to grievance mechanisms.',
        'Write expectations in plain language and link each to a practical example. Suppliers in different countries operate under different laws; the code should require at least legal compliance and set out the higher standard you expect over time.',
        'Introduce changes through supplier briefings rather than only a contract update. Explain why the expectations matter, what support is available and when you will ask for information.',
      ],
      keyPoints: [
        'Be specific about pay, harassment, maternity and safety.',
        'Require legal compliance and signal the higher standard.',
        'Introduce changes through briefings, not paperwork alone.',
      ],
    },
    {
      id: 'crs-supplier-engagement-l2',
      title: 'Asking the right questions',
      type: 'video',
      minutes: 9,
      summary:
        'Proportionate assessment questions that reveal real practice without overwhelming suppliers.',
      body: [
        'Ask fewer, better questions. Five to eight questions about policies, workforce composition and grievance mechanisms will tell you more than a long questionnaire that suppliers complete without care.',
        'Tailor depth to risk. High-risk categories, such as labour-intensive manufacturing or agriculture, justify site visits and worker interviews; low-risk professional services may only need a self-declaration.',
        'Share results back with suppliers. A short summary of how they compare with peers and what good practice looks like turns an assessment into a learning opportunity.',
      ],
      keyPoints: [
        'Keep questionnaires short and focused.',
        'Match depth of assessment to category risk.',
        'Share findings back to drive improvement.',
      ],
      transcript:
        'Supplier questionnaires are often long and ignored. In this lesson we focus on a short set of questions that actually reveal practice: Do you have a written anti-harassment policy? What share of your workforce and supervisors are women? How can workers raise a complaint safely? Use risk to decide how deep to go, and always share what you learned with the supplier.',
    },
    {
      id: 'crs-supplier-engagement-l3',
      title: 'Supporting improvement',
      type: 'reflection',
      minutes: 8,
      summary: 'How to respond constructively when suppliers fall short.',
      body: [
        'When a supplier falls short, the first response should usually be a corrective action plan with clear steps and dates, not termination. Exiting a supplier can harm the very workers you aim to protect.',
        'Offer practical support: templates, training sessions, introductions to local organisations and, for strategic suppliers, joint improvement projects. Recognise progress publicly where suppliers agree.',
        'Escalate only when there is serious harm or repeated failure to engage. Document each step so decisions are consistent and defensible.',
      ],
      keyPoints: [
        'Start with corrective action plans, not exit.',
        'Offer templates, training and joint projects.',
        'Escalate consistently and document decisions.',
      ],
      reflectionPrompt:
        'Think of a supplier that may not yet meet your expectations. What support could you offer, and what would trigger escalation?',
    },
    quizLesson(
      'crs-supplier-engagement',
      'Supplier engagement quiz',
      'Check your understanding of supplier codes, assessment and improvement.',
      [
        {
          text: 'Which addition makes a supplier code more specific on gender equality?',
          options: [
            'A general statement on ethics',
            'Expectations on equal pay, harassment and maternity protection',
            'A requirement to use company branding',
            'A longer payment term',
          ],
          correctIndex: 1,
          explanation:
            'Specific expectations on pay, harassment and maternity make the code actionable.',
        },
        {
          text: 'How should assessment depth be decided?',
          options: [
            'The same for every supplier',
            'Based on supplier size only',
            'Based on the risk of the category',
            'By the supplier',
          ],
          correctIndex: 2,
          explanation:
            'Risk-based assessment focuses effort where workers are most likely to be affected.',
        },
        {
          text: 'What is usually the best first response to a supplier shortfall?',
          options: [
            'Immediate termination',
            'A corrective action plan with support',
            'Ignoring it until renewal',
            'Public criticism',
          ],
          correctIndex: 1,
          explanation:
            'Corrective action with support improves conditions for workers rather than simply moving the problem.',
        },
        {
          text: 'Why share assessment results back with suppliers?',
          options: [
            'It is legally required',
            'It turns assessment into a learning opportunity',
            'It reduces the buyer’s workload',
            'It replaces the need for a code of conduct',
          ],
          correctIndex: 1,
          explanation:
            'Feedback and peer comparison help suppliers understand what good practice looks like.',
        },
      ],
    ),
  ],
}

/* ------------------------------------------------------------------ Marketing -- */

const inclusiveCommunications: Course = {
  id: 'crs-inclusive-communications',
  slug: 'inclusive-communications',
  title: 'Inclusive Communications and Marketing',
  objective:
    'Create marketing and internal communications that avoid stereotypes and represent women fairly.',
  description:
    'For marketing and communications teams who want to check campaigns, imagery and copy for gender stereotypes. Includes a review checklist and guidance on briefing agencies.',
  outcomes: [
    'Recognise common gender stereotypes in imagery and copy.',
    'Apply a simple review checklist before campaigns launch.',
    'Brief agencies and partners with clear inclusion expectations.',
    'Measure representation across your published content.',
  ],
  image: images.courses.inclusiveCommunications.src,
  departments: ['marketing'],
  principle: 5,
  topic: 'Marketing',
  language: 'English',
  designated: true,
  relatedEventId: 'evt-inclusive-comms-webinar',
  audience: 'employee',
  published: true,
  lessons: [
    {
      id: 'crs-inclusive-communications-l1',
      title: 'How stereotypes show up in marketing',
      type: 'video',
      minutes: 9,
      summary:
        'Common patterns that limit how women and men are portrayed, and their business cost.',
      body: [
        'Stereotypes in marketing are often subtle: women shown mainly in domestic or caring roles, men as the experts or decision-makers, women’s bodies used decoratively, and narrow ideas of age, body type and ability.',
        'These portrayals reinforce expectations about what women and men can do. They also carry business risk: audiences increasingly notice and reject stereotyped content, and campaigns that portray people authentically tend to build stronger brand trust.',
        'The aim is not to avoid showing women in caring roles but to show a full range of people in a full range of roles, with agency and depth. Ask who is speaking, who is acting and who is being looked at.',
      ],
      keyPoints: [
        'Look at roles, agency and how bodies are portrayed.',
        'Stereotyped content carries reputational and commercial risk.',
        'Ask who speaks, who acts and who is looked at.',
      ],
      transcript:
        'Pick up any three adverts from last month. Who is the expert? Who is cleaning, cooking or caring? Who is shown as a body rather than a person? In this lesson we look at the patterns behind those choices and why changing them is good for people and good for brands.',
    },
    {
      id: 'crs-inclusive-communications-l2',
      title: 'Writing inclusive copy',
      type: 'reading',
      minutes: 10,
      summary: 'Language choices that include everyone and avoid unintended bias.',
      body: [
        'Use gender-neutral terms for roles where gender is not relevant: chair rather than chairman, staffing rather than manpower, salesperson rather than salesman. In languages with grammatical gender, follow your organisation’s agreed style and use inclusive forms where they exist.',
        'Avoid descriptions that focus on women’s appearance, family status or emotions when the same details would not be mentioned for men. Describe expertise and achievements in equal terms.',
        'Create a short house style note with preferred terms and examples, and make it part of your copy review. Consistency across teams matters more than perfection in any single piece.',
      ],
      keyPoints: [
        'Use gender-neutral role terms where gender is not relevant.',
        'Describe women and men in equivalent terms.',
        'Capture choices in a short house style note.',
      ],
    },
    {
      id: 'crs-inclusive-communications-l3',
      title: 'A pre-launch review checklist',
      type: 'reading',
      minutes: 12,
      summary: 'A practical checklist to review campaigns before they go live.',
      body: [
        'Before a campaign launches, review it against a short list of questions. Are women and men shown in a range of roles, including as experts and leaders? Are people shown with agency rather than as decoration? Do images reflect diversity of age, ethnicity, body type and ability relevant to your audience?',
        'Check the copy for stereotyped assumptions and the voice-over and credits for who is given authority. For product marketing, check whether products are unnecessarily gendered by colour or name.',
        'Assign the checklist to a named reviewer, record the outcome and keep a simple log. Over a year, the log becomes evidence of practice for your WEPs reporting.',
      ],
      keyPoints: [
        'Review roles, agency and diversity in imagery.',
        'Check copy, voice-over and product naming.',
        'Name a reviewer and log outcomes as evidence.',
      ],
    },
    {
      id: 'crs-inclusive-communications-l4',
      title: 'Briefing agencies and measuring progress',
      type: 'reflection',
      minutes: 10,
      summary: 'Embed expectations in agency briefs and track representation over time.',
      body: [
        'Most campaigns are produced with agencies, photographers and influencers. Include your inclusion expectations in every creative brief, along with the checklist, and ask partners how they will meet them.',
        'Measure representation across published content. A simple quarterly sample — counting who appears, in which roles and who speaks — shows whether practice is changing.',
        'Share findings with the team and celebrate good examples. Progress is easier to sustain when people can see what good looks like.',
      ],
      keyPoints: [
        'Put inclusion expectations in every creative brief.',
        'Sample published content quarterly.',
        'Share and celebrate good examples.',
      ],
      reflectionPrompt:
        'Which upcoming campaign or brief will you apply this to, and what one measure of representation will you start tracking?',
    },
    quizLesson(
      'crs-inclusive-communications',
      'Inclusive communications quiz',
      'Check your understanding of stereotypes, inclusive copy and review practice.',
      [
        {
          text: 'Which is an example of a subtle gender stereotype in marketing?',
          options: [
            'A woman engineer explaining a product feature',
            'Men consistently shown as experts while women are shown as users',
            'A mixed team in an office',
            'A father caring for a child',
          ],
          correctIndex: 1,
          explanation: 'Consistently assigning expertise to men is a common, subtle stereotype.',
        },
        {
          text: 'Which term is the most inclusive choice?',
          options: ['Chairman', 'Manpower', 'Chair', 'Salesman'],
          correctIndex: 2,
          explanation: '“Chair” is gender-neutral and appropriate when gender is not relevant.',
        },
        {
          text: 'What should a pre-launch review check in imagery?',
          options: [
            'Only the brand colours',
            'Roles, agency and diversity of the people shown',
            'Image resolution',
            'The photographer’s fee',
          ],
          correctIndex: 1,
          explanation: 'The review looks at how people are portrayed, not just production quality.',
        },
        {
          text: 'Why keep a log of campaign reviews?',
          options: [
            'To slow down approvals',
            'It provides evidence of practice for reporting',
            'Agencies require it',
            'To replace the creative brief',
          ],
          correctIndex: 1,
          explanation: 'A log documents consistent practice and supports WEPs reporting.',
        },
        {
          text: 'Where should inclusion expectations for agencies be set out?',
          options: [
            'In the final invoice',
            'In every creative brief',
            'Only in the annual contract',
            'Verbally at the end of the project',
          ],
          correctIndex: 1,
          explanation:
            'Setting expectations in the brief ensures they shape the work from the start.',
        },
      ],
    ),
  ],
}

const responsibleRepresentation: Course = {
  id: 'crs-responsible-representation',
  slug: 'responsible-representation',
  title: 'Responsible Representation in Content',
  objective:
    'Produce photography, video and stories that portray women with dignity, consent and authenticity.',
  description:
    'Focuses on the production side of communications: casting, consent, storytelling about beneficiaries and employees, and using your platforms to advocate for gender equality.',
  outcomes: [
    'Apply consent and dignity principles in photography and storytelling.',
    'Cast and brief content to reflect authentic diversity.',
    'Use company channels responsibly for gender equality advocacy.',
  ],
  image: images.courses.responsibleRepresentation.src,
  departments: ['marketing'],
  principle: 6,
  topic: 'Representation',
  language: 'English',
  audience: 'employee',
  published: true,
  lessons: [
    {
      id: 'crs-responsible-representation-l1',
      title: 'Consent and dignity in storytelling',
      type: 'reading',
      minutes: 10,
      summary: 'Ethical standards for featuring employees, suppliers and community members.',
      body: [
        'Informed consent means people understand how their image and story will be used, where it will appear and for how long, and that they can say no without consequence. Use plain-language consent forms in the person’s own language.',
        'Portray people as active participants with their own voice, not as passive recipients of help. Let them describe their experience in their own words and review quotes before publication where possible.',
        'Take extra care with stories involving violence, health or other sensitive experiences. Avoid identifying details, and consider whether the story needs to be told at all.',
      ],
      keyPoints: [
        'Consent must be informed, specific and freely given.',
        'Show people as active participants with their own voice.',
        'Protect identity in sensitive stories.',
      ],
    },
    {
      id: 'crs-responsible-representation-l2',
      title: 'Casting and production choices',
      type: 'video',
      minutes: 8,
      summary: 'How casting, styling and direction shape representation on set.',
      body: [
        'Representation is decided long before editing. Cast for a range of ages, body types, ethnicities and abilities that reflects your audience, and avoid casting women only in supporting roles.',
        'On set, direction matters: who is positioned centrally, who holds the tools, who is speaking to camera. Agree these choices in the shot list.',
        'Where possible, feature real employees and suppliers rather than stock imagery, with consent and fair compensation for their time.',
      ],
      keyPoints: [
        'Cast for authentic diversity.',
        'Plan who leads in each shot.',
        'Prefer real people, with consent and fair compensation.',
      ],
      transcript:
        'This lesson takes you on set. Watch for three choices: who is in the centre of the frame, who is holding the tools or the data, and who is speaking. Agree these in the shot list so that representation is planned rather than left to chance.',
    },
    {
      id: 'crs-responsible-representation-l3',
      title: 'Advocacy on company channels',
      type: 'reflection',
      minutes: 8,
      summary: 'Using your platforms to support gender equality credibly.',
      body: [
        'Advocacy is credible when it matches action. Before a campaign for International Women’s Day or similar moments, check that you can point to concrete company commitments and progress.',
        'Amplify voices beyond your company: women entrepreneurs in your value chain, community organisations and employee networks. Share the platform rather than speaking for others.',
        'Plan advocacy across the year rather than only on awareness days, and link it to your WEPs commitments so audiences can see the substance behind the message.',
      ],
      keyPoints: [
        'Match advocacy with evidence of action.',
        'Amplify others’ voices.',
        'Plan advocacy throughout the year.',
      ],
      reflectionPrompt:
        'What company commitment could you communicate credibly this year, and whose voice outside the company could you amplify?',
    },
    quizLesson(
      'crs-responsible-representation',
      'Responsible representation quiz',
      'Check your understanding of consent, production and advocacy.',
      [
        {
          text: 'What makes consent informed?',
          options: [
            'A signature on any form',
            'The person understands how, where and for how long their story will be used',
            'Verbal agreement from their manager',
            'Payment for their time',
          ],
          correctIndex: 1,
          explanation:
            'Informed consent requires understanding of use, placement and duration, with freedom to refuse.',
        },
        {
          text: 'Which production choice best supports fair representation?',
          options: [
            'Casting women mainly in supporting roles',
            'Planning who leads each shot in the shot list',
            'Using only stock imagery',
            'Leaving framing decisions to the edit',
          ],
          correctIndex: 1,
          explanation: 'Planning roles in the shot list makes representation deliberate.',
        },
        {
          text: 'When is gender equality advocacy most credible?',
          options: [
            'When it is limited to awareness days',
            'When it matches concrete company action',
            'When it uses celebrity endorsements',
            'When it avoids mentioning the company',
          ],
          correctIndex: 1,
          explanation:
            'Audiences trust advocacy that is backed by visible commitments and progress.',
        },
        {
          text: 'How should sensitive stories be handled?',
          options: [
            'Publish full names for authenticity',
            'Protect identifying details and consider whether the story needs telling',
            'Only publish internally',
            'Avoid any review',
          ],
          correctIndex: 1,
          explanation: 'Protecting identity and weighing the need for the story prevents harm.',
        },
      ],
    ),
  ],
}

/* ------------------------------------------------------------------ Leadership -- */

const leadershipAccountability: Course = {
  id: 'crs-leadership-accountability',
  slug: 'leadership-accountability',
  title: 'Leadership Accountability for Gender Equality',
  objective:
    'Equip senior leaders to set direction, allocate resources and hold the organisation accountable for WEPs commitments.',
  description:
    'A course for CEOs, executive teams and board members on making gender equality a strategic priority. Covers commitment, governance, targets and how leaders review progress.',
  outcomes: [
    'Translate the CEO Statement of Support into specific leadership commitments.',
    'Set up governance and named accountability for WEPs actions.',
    'Choose a small set of targets and review them regularly.',
    'Communicate progress honestly inside and outside the company.',
  ],
  image: images.courses.leadershipAccountability.src,
  departments: ['leadership', 'sustainability'],
  principle: 1,
  topic: 'Leadership',
  language: 'English',
  designated: true,
  relatedEventId: 'evt-reporting-clinic',
  audience: 'leadership',
  published: true,
  lessons: [
    {
      id: 'crs-leadership-accountability-l1',
      title: 'From commitment to strategy',
      type: 'video',
      minutes: 9,
      summary: 'How leaders turn a public commitment into strategic priorities.',
      body: [
        'Signing the WEPs CEO Statement of Support is a public commitment. Its value depends on what follows: leaders who name gender equality as a strategic priority, link it to business objectives and allocate budget and people to deliver it.',
        'Start by connecting gender equality to existing strategy. In a retail business this might mean the customer base, talent pipeline in stores and supplier base; in financial services, product design and lending portfolios.',
        'Agree three to five priorities for the next two years, each with an executive owner. Fewer priorities with real resources achieve more than a long list without ownership.',
      ],
      keyPoints: [
        'A commitment needs priorities, budget and owners.',
        'Link gender equality to existing business strategy.',
        'Choose three to five priorities with executive owners.',
      ],
      transcript:
        'As a leader, your signature on the CEO Statement of Support is the start, not the end. In this lesson we look at how to connect that commitment to your strategy. Where does gender equality affect your customers, your workforce and your suppliers? Which three to five priorities will make the biggest difference over the next two years? And who on your executive team will own each one?',
    },
    {
      id: 'crs-leadership-accountability-l2',
      title: 'Governance and accountability',
      type: 'reading',
      minutes: 11,
      summary: 'Structures that keep gender equality on the leadership agenda.',
      body: [
        'Assign responsibility at three levels: an executive sponsor who answers to the CEO and board, a focal point who coordinates day-to-day work, and department owners who deliver actions. Write these roles down and share them.',
        'Put gender equality progress on the executive agenda at least quarterly and on the board agenda at least annually. Use a short dashboard of agreed indicators and action status rather than lengthy narrative reports.',
        'Consider linking a portion of executive performance objectives to delivery of gender equality actions. What gets reviewed and rewarded gets done.',
      ],
      keyPoints: [
        'Name a sponsor, focal point and department owners.',
        'Review progress quarterly at executive level and annually at board.',
        'Link performance objectives to delivery.',
      ],
    },
    {
      id: 'crs-leadership-accountability-l3',
      title: 'Setting targets that matter',
      type: 'reading',
      minutes: 12,
      summary: 'How to choose a small set of meaningful, measurable targets.',
      body: [
        'Good targets are specific, time-bound and connected to your priorities. Common choices include women’s representation in senior management, the median gender pay gap, spend with women-owned businesses and completion of gender equality training.',
        'Base targets on a baseline and on what peers have achieved. An ambitious but credible target builds momentum; an unrealistic one undermines trust when it is missed.',
        'Publish targets alongside the actions that will achieve them. The WEPs Transparency and Accountability Framework provides a structure of indicators that companies can draw on when deciding what to measure and report.',
      ],
      keyPoints: [
        'Choose specific, time-bound targets linked to priorities.',
        'Base targets on a baseline and peer evidence.',
        'Publish targets with the actions behind them.',
      ],
    },
    {
      id: 'crs-leadership-accountability-l4',
      title: 'Your leadership commitments',
      type: 'reflection',
      minutes: 10,
      summary: 'Decide the personal actions you will take as a leader this year.',
      body: [
        'Leaders influence culture through what they do as well as what they decide. Visible actions include sponsoring women for senior roles, speaking about the company’s commitment, chairing progress reviews and asking for gender-disaggregated data in routine decisions.',
        'Choose two or three personal commitments for the year and share them with your team. Be specific about frequency and outcome, for example “review promotion shortlists by gender before every round”.',
        'Plan how you will review your own progress. Bring your commitments to the Reporting Clinic, where leaders compare approaches and test how they will report on them.',
      ],
      keyPoints: [
        'Personal leadership actions shape culture.',
        'Make two or three specific, shared commitments.',
        'Review and report on your own progress.',
      ],
      reflectionPrompt:
        'What two leadership commitments will you make this year, how will your team see them in practice, and how will you report on them?',
    },
    quizLesson(
      'crs-leadership-accountability',
      'Leadership accountability quiz',
      'Check your understanding of leadership commitment, governance and targets.',
      [
        {
          text: 'What gives a CEO Statement of Support its value?',
          options: [
            'Publishing it on the website',
            'The priorities, resources and owners that follow it',
            'The number of leaders who sign it',
            'Its length',
          ],
          correctIndex: 1,
          explanation:
            'A commitment becomes meaningful when it is translated into owned and resourced priorities.',
        },
        {
          text: 'How often should the executive team review gender equality progress, at minimum?',
          options: ['Every five years', 'Annually', 'Quarterly', 'Only when reporting is due'],
          correctIndex: 2,
          explanation:
            'Quarterly executive review keeps progress visible and allows course correction.',
        },
        {
          text: 'Which is the best example of a meaningful target?',
          options: [
            'Improve gender balance',
            'Increase women in senior management from 28 to 35 percent by end of 2028',
            'Be a leader in diversity',
            'Hold more events for women',
          ],
          correctIndex: 1,
          explanation: 'It is specific, measurable and time-bound, with a clear baseline.',
        },
        {
          text: 'Why limit the number of strategic priorities?',
          options: [
            'Fewer priorities with real resources achieve more',
            'Reporting rules require it',
            'It avoids involving departments',
            'It reduces the need for targets',
          ],
          correctIndex: 0,
          explanation: 'Concentrating resources and ownership on a few priorities drives delivery.',
        },
        {
          text: 'Which is a visible personal leadership action?',
          options: [
            'Delegating all gender equality work to HR',
            'Reviewing promotion shortlists by gender before each round',
            'Waiting for annual results',
            'Avoiding public statements',
          ],
          correctIndex: 1,
          explanation: 'Regular, specific personal actions signal priority and influence outcomes.',
        },
      ],
    ),
  ],
}

const actionPlanning: Course = {
  id: 'crs-action-planning',
  slug: 'action-planning',
  title: 'From Assessment to Action Plan',
  objective: 'Turn assessment findings into a practical, owned gender action plan.',
  description:
    'Shows how to move from a baseline assessment to a prioritised action plan with owners, targets, deadlines and evidence requirements. Useful for focal points and department leads in every function.',
  outcomes: [
    'Prioritise assessment gaps by impact and feasibility.',
    'Write actions with owners, baselines, targets and evidence.',
    'Review and update the plan through the year.',
  ],
  image: images.courses.actionPlanning.src,
  departments: ['procurement', 'marketing', 'leadership', 'sustainability', 'hr'],
  principle: 1,
  topic: 'Action planning',
  language: 'English',
  audience: 'all',
  published: true,
  lessons: [
    {
      id: 'crs-action-planning-l1',
      title: 'Prioritising your gaps',
      type: 'reading',
      minutes: 10,
      summary: 'How to choose which assessment findings to act on first.',
      body: [
        'A baseline assessment usually reveals more gaps than you can address in one year. Score each gap on two dimensions: impact on women in your workforce and value chain, and feasibility given current resources and timing.',
        'Start with high-impact, high-feasibility items, and add one or two high-impact items that need longer preparation. Record why lower-priority gaps are deferred so the decision is transparent.',
        'Involve department leads in prioritising. Actions chosen with the people who will deliver them are far more likely to happen.',
      ],
      keyPoints: [
        'Score gaps on impact and feasibility.',
        'Combine quick wins with one or two longer-term items.',
        'Prioritise with the people who will deliver.',
      ],
    },
    {
      id: 'crs-action-planning-l2',
      title: 'Writing actions that get done',
      type: 'video',
      minutes: 9,
      summary: 'The elements of a well-written action.',
      body: [
        'Every action needs a clear purpose, a single owner, a baseline, a target, a due date and a description of the evidence that will show it is complete. Without these, actions drift.',
        'Write actions as outcomes, not activities. “Introduce structured interviews for all manager-level vacancies” is better than “Look into interview practice”.',
        'Link each action to the WEPs principle it supports and to any learning or resources that will help the owner. The WEPs Gender Action Plan Template provides a useful structure.',
      ],
      keyPoints: [
        'Purpose, owner, baseline, target, due date and evidence.',
        'Write outcomes, not activities.',
        'Link to principles and supporting resources.',
      ],
      transcript:
        'An action plan is only as good as its actions. In this lesson we take a vague action and rewrite it step by step: add an owner, a baseline, a target, a deadline and the evidence you will collect. By the end, anyone reading it should know exactly what done looks like.',
    },
    {
      id: 'crs-action-planning-l3',
      title: 'Keeping the plan alive',
      type: 'reflection',
      minutes: 8,
      summary: 'Routines for reviewing and updating the action plan through the year.',
      body: [
        'Schedule a short monthly check-in between the focal point and action owners, and a quarterly review with the executive sponsor. Focus on blockers and decisions needed rather than status reading.',
        'Collect evidence as you go. Uploading a policy, training record or data extract when an action is completed saves weeks at reporting time.',
        'Revise the plan when circumstances change. Closing or re-scoping an action with a recorded reason is better than leaving it overdue.',
      ],
      keyPoints: [
        'Monthly owner check-ins and quarterly sponsor reviews.',
        'Collect evidence when actions complete.',
        'Re-scope transparently when needed.',
      ],
      reflectionPrompt:
        'Which action in your plan is most at risk of drifting, and what one change to its owner, target or evidence would make it more likely to succeed?',
    },
    quizLesson(
      'crs-action-planning',
      'Action planning quiz',
      'Check your understanding of prioritising and writing actions.',
      [
        {
          text: 'Which two dimensions help prioritise assessment gaps?',
          options: [
            'Cost and popularity',
            'Impact and feasibility',
            'Length and complexity',
            'Department and location',
          ],
          correctIndex: 1,
          explanation:
            'Impact and feasibility together show where effort will make the most difference.',
        },
        {
          text: 'Which is a well-written action?',
          options: [
            'Look into interview practice',
            'Improve diversity',
            'Introduce structured interviews for all manager-level vacancies by June',
            'Discuss gender at the next meeting',
          ],
          correctIndex: 2,
          explanation: 'It is a specific outcome with a scope and deadline.',
        },
        {
          text: 'Why collect evidence as actions complete?',
          options: [
            'It is only needed for audits',
            'It saves significant effort at reporting time',
            'It replaces the action plan',
            'Owners prefer it',
          ],
          correctIndex: 1,
          explanation:
            'Gathering evidence in real time makes annual reporting faster and more accurate.',
        },
        {
          text: 'What should happen to an action that is no longer feasible?',
          options: [
            'Leave it overdue',
            'Delete it without explanation',
            'Close or re-scope it with a recorded reason',
            'Reassign it to the CEO',
          ],
          correctIndex: 2,
          explanation: 'Transparent re-scoping keeps the plan credible.',
        },
      ],
    ),
  ],
}

const evidenceReporting: Course = {
  id: 'crs-evidence-reporting',
  slug: 'evidence-reporting',
  title: 'Evidence and Reporting on Progress',
  objective:
    'Collect reliable data and evidence and report progress on gender equality transparently.',
  description:
    'Guides sustainability and reporting teams through collecting gender-disaggregated data, documenting evidence and writing an honest annual progress report aligned with the WEPs Transparency and Accountability Framework.',
  outcomes: [
    'Identify the data needed for core gender equality indicators.',
    'Document evidence that supports reported progress.',
    'Write a balanced progress narrative that covers challenges.',
  ],
  image: images.courses.evidenceReporting.src,
  departments: ['sustainability', 'leadership'],
  principle: 7,
  topic: 'Reporting',
  language: 'English',
  audience: 'all',
  published: true,
  lessons: [
    {
      id: 'crs-evidence-reporting-l1',
      title: 'Collecting gender-disaggregated data',
      type: 'reading',
      minutes: 12,
      summary: 'What data to collect for core indicators and how to make it reliable.',
      body: [
        'Core indicators typically include women’s representation across the workforce, management and board, the gender pay gap, participation in training, parental leave and return rates, and spend with women-owned businesses.',
        'For each indicator, document the definition, data source, coverage (which entities and countries are included) and period. Consistent definitions across years matter more than perfect precision in a single year.',
        'Agree data owners in HR, finance and procurement and a timetable for extracting data. Note gaps honestly: an indicator not yet measured should be reported as not available, with a plan to collect it.',
      ],
      keyPoints: [
        'Know the core indicators and their data sources.',
        'Document definition, coverage and period for each.',
        'Report gaps honestly as not available.',
      ],
    },
    {
      id: 'crs-evidence-reporting-l2',
      title: 'Documenting evidence',
      type: 'video',
      minutes: 8,
      summary: 'What counts as evidence and how to organise it.',
      body: [
        'Evidence shows that an action happened and what it achieved. Examples include approved policies, training attendance records, procurement data extracts, board minutes and survey results.',
        'Store evidence centrally, named consistently and linked to the action or indicator it supports. Remove personal data that is not needed.',
        'Assign a reviewer to check evidence before submission. A short checklist — is it dated, approved, relevant and complete? — prevents rework.',
      ],
      keyPoints: [
        'Evidence proves both activity and result.',
        'Store centrally and link to actions or indicators.',
        'Review evidence before submission.',
      ],
      transcript:
        'Good reporting rests on evidence. In this lesson we look at what counts — policies, records, data extracts, minutes — and how to organise it so that anyone reviewing your report can trace each claim back to its source.',
    },
    {
      id: 'crs-evidence-reporting-l3',
      title: 'Writing a balanced progress narrative',
      type: 'reflection',
      minutes: 10,
      summary: 'How to report progress, setbacks and next steps credibly.',
      body: [
        'A credible narrative explains what the company committed to, what it did, what changed and what did not. Readers trust reports that acknowledge challenges and explain how they will be addressed.',
        'Use data to support statements and compare with the previous year. Avoid presenting isolated activities as outcomes.',
        'The WEPs Transparency and Accountability Roadmap helps companies plan reporting over time. Close the narrative with clear priorities for the next period and the leadership commitment behind them.',
      ],
      keyPoints: [
        'Cover progress and challenges.',
        'Support claims with year-on-year data.',
        'End with next priorities and leadership commitment.',
      ],
      reflectionPrompt:
        'What is one challenge your company should report honestly this year, and how will you describe the plan to address it?',
    },
    quizLesson(
      'crs-evidence-reporting',
      'Evidence and reporting quiz',
      'Check your understanding of data, evidence and narrative reporting.',
      [
        {
          text: 'How should an indicator that was not measured this year be reported?',
          options: [
            'Estimated from last year',
            'Left out without comment',
            'Reported as not available with a plan to collect it',
            'Replaced with a different indicator',
          ],
          correctIndex: 2,
          explanation:
            'Honest reporting of gaps builds credibility and sets up future measurement.',
        },
        {
          text: 'What should be documented for each indicator?',
          options: [
            'Only the value',
            'Definition, data source, coverage and period',
            'The name of the person who calculated it',
            'The software used',
          ],
          correctIndex: 1,
          explanation:
            'These details make indicators comparable across years and understandable to readers.',
        },
        {
          text: 'Which is the strongest evidence that a new policy is in place?',
          options: [
            'An email saying it is being drafted',
            'The approved, dated policy and its communication to employees',
            'A presentation slide',
            'A verbal confirmation',
          ],
          correctIndex: 1,
          explanation:
            'An approved, dated document with proof of communication shows the policy exists and is in use.',
        },
        {
          text: 'What makes a progress narrative credible?',
          options: [
            'Only reporting successes',
            'Listing as many activities as possible',
            'Acknowledging challenges and supporting claims with data',
            'Using the same text every year',
          ],
          correctIndex: 2,
          explanation:
            'Balanced reporting backed by data earns trust from readers and stakeholders.',
        },
      ],
    ),
  ],
}

/**
 * Course builder structure: two modules over the non-quiz lessons, a short ungraded pre-test
 * drawn from the post-test questions, and builder settings.
 */
const withBuilder = (
  course: Course,
  modules: [string, string],
  difficulty: Course['difficulty'],
  updatedAt: string,
): Course => {
  const units = course.lessons.filter((l) => l.type !== 'quiz')
  const split = Math.ceil(units.length / 2)
  const quiz = course.lessons.find((l) => l.type === 'quiz')?.quiz ?? []
  return {
    ...course,
    modules: [
      {
        id: `${course.id}-m1`,
        title: modules[0],
        lessonIds: units.slice(0, split).map((l) => l.id),
      },
      { id: `${course.id}-m2`, title: modules[1], lessonIds: units.slice(split).map((l) => l.id) },
    ],
    preTest: {
      title: `${course.title}: starting check`,
      questions: quiz.slice(0, 3).map((q, i) => ({ ...q, id: `${course.id}-pre${i + 1}` })),
    },
    difficulty,
    certificate: true,
    updatedAt,
  }
}

export const courses: Course[] = [
  withBuilder(
    inclusiveRecruitment,
    ['Understanding bias in hiring', 'Building a fair process'],
    'beginner',
    '2026-10-12T09:00:00Z',
  ),
  withBuilder(
    fairProgressionPay,
    ['Pay equity basics', 'Fair promotion decisions'],
    'intermediate',
    '2026-10-08T09:00:00Z',
  ),
  withBuilder(
    workplaceWellbeing,
    ['A safe workplace', 'Wellbeing in practice'],
    'beginner',
    '2026-09-30T09:00:00Z',
  ),
  withBuilder(
    genderResponsiveProcurement,
    ['Why procurement matters', 'Changing how you buy'],
    'beginner',
    '2026-10-15T09:00:00Z',
  ),
  withBuilder(
    supplierEngagement,
    ['Setting expectations', 'Working with suppliers'],
    'intermediate',
    '2026-09-22T09:00:00Z',
  ),
  withBuilder(
    inclusiveCommunications,
    ['Spotting stereotypes', 'Launching inclusive campaigns'],
    'beginner',
    '2026-10-14T09:00:00Z',
  ),
  withBuilder(
    responsibleRepresentation,
    ['Consent and casting', 'Telling the story'],
    'intermediate',
    '2026-09-18T09:00:00Z',
  ),
  withBuilder(
    leadershipAccountability,
    ['Strategy and governance', 'Targets and commitments'],
    'advanced',
    '2026-10-10T09:00:00Z',
  ),
  withBuilder(
    actionPlanning,
    ['Choosing priorities', 'Delivering the plan'],
    'intermediate',
    '2026-10-02T09:00:00Z',
  ),
  withBuilder(
    evidenceReporting,
    ['Data and evidence', 'Reporting progress'],
    'advanced',
    '2026-09-26T09:00:00Z',
  ),
]

export const learningPaths: LearningPath[] = [
  {
    id: 'path-hr',
    department: 'hr',
    title: 'HR Pathway: Fair and Inclusive Workplaces',
    description:
      'Build fair hiring, pay and wellbeing practices. Complete the designated Inclusive Recruitment course and quiz to unlock the Inclusive Recruitment Clinic.',
    courseIds: ['crs-inclusive-recruitment', 'crs-fair-progression-pay', 'crs-workplace-wellbeing'],
    designatedCourseId: 'crs-inclusive-recruitment',
    clinicId: 'evt-inclusive-recruitment-clinic',
  },
  {
    id: 'path-procurement',
    department: 'procurement',
    title: 'Procurement Pathway: Gender-responsive Sourcing',
    description:
      'Grow spend with women-owned businesses and improve supplier practices. Complete the designated procurement course and quiz to unlock the Procurement Clinic.',
    courseIds: [
      'crs-gender-responsive-procurement',
      'crs-supplier-engagement',
      'crs-action-planning',
    ],
    designatedCourseId: 'crs-gender-responsive-procurement',
    clinicId: 'evt-procurement-clinic',
  },
  {
    id: 'path-marketing',
    department: 'marketing',
    title: 'Marketing Pathway: Inclusive Communications',
    description:
      'Create campaigns and content that represent women fairly. Complete the designated Inclusive Communications course and quiz to unlock the Inclusive Communications Webinar.',
    courseIds: [
      'crs-inclusive-communications',
      'crs-responsible-representation',
      'crs-action-planning',
    ],
    designatedCourseId: 'crs-inclusive-communications',
    clinicId: 'evt-inclusive-comms-webinar',
  },
  {
    id: 'path-leadership',
    department: 'leadership',
    title: 'Leadership Pathway: Accountability and Reporting',
    description:
      'Set direction, govern delivery and report progress with confidence. Complete the designated Leadership Accountability course and quiz to unlock the Reporting Clinic.',
    courseIds: ['crs-leadership-accountability', 'crs-action-planning', 'crs-evidence-reporting'],
    designatedCourseId: 'crs-leadership-accountability',
    clinicId: 'evt-reporting-clinic',
  },
  {
    id: 'path-sustainability',
    department: 'sustainability',
    title: 'Sustainability Pathway: Measurement and Disclosure',
    description:
      'Coordinate data, evidence and annual reporting on the WEPs. Complete the designated Leadership Accountability course and quiz to unlock the Reporting Clinic.',
    courseIds: ['crs-leadership-accountability', 'crs-evidence-reporting', 'crs-action-planning'],
    designatedCourseId: 'crs-leadership-accountability',
    clinicId: 'evt-reporting-clinic',
  },
  {
    id: 'path-operations',
    department: 'operations',
    title: 'Operations Pathway: Safe and Fair Operations',
    description:
      'Apply fair hiring, safety and pay practices across sites and shifts. Complete the designated Inclusive Recruitment course and quiz to unlock the Inclusive Recruitment Clinic.',
    courseIds: ['crs-inclusive-recruitment', 'crs-workplace-wellbeing', 'crs-fair-progression-pay'],
    designatedCourseId: 'crs-inclusive-recruitment',
    clinicId: 'evt-inclusive-recruitment-clinic',
  },
]
