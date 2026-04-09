/**
 * Seed script for Jobinator.
 *
 * Run with: npm run seed
 *
 * Pass 1: insert all question nodes without FK links (yes_next / no_next / profession_id)
 * Pass 2: patch FK links using the UUID map from pass 1
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

interface ProfessionRaw {
  name: string
  description: string
  traits: string[]
  related_names: string[]
}

interface QuestionNode {
  key: string
  text: string
  yes: string   // key of yes_next node, or profession name (prefixed with 'prof:')
  no: string    // key of no_next node, or profession name (prefixed with 'prof:')
  is_root?: boolean
}

// ─── Decision Tree ────────────────────────────────────────────────────────────
//
// Domain split (L1-2): tech | engineering | healthcare | legal-finance | creative | ops/business
// Environment (L3-4): indoors/field, solo/team
// Work style (L5-7): analytical/creative, client-facing, shift-based
// Differentiators (L8+): specific role distinctions
//
// Convention:
//   yes_next / no_next values starting with 'prof:' are leaf nodes → profession
//   all other values are keys into this array

const TREE: QuestionNode[] = [
  // ── Root ──────────────────────────────────────────────────────────────────
  {
    key: 'root',
    text: 'Do you enjoy working with computers or technology on a daily basis?',
    yes: 'tech_stem',
    no: 'non_tech',
    is_root: true,
  },

  // ── Tech branch ───────────────────────────────────────────────────────────
  {
    key: 'tech_stem',
    text: 'Are you more interested in building software than in understanding the data it produces?',
    yes: 'build_software',
    no: 'data_security',
  },
  {
    key: 'build_software',
    text: 'Do you care most about how things look and feel to the user?',
    yes: 'ui_focus',
    no: 'backend_focus',
  },
  {
    key: 'ui_focus',
    text: 'Is your passion more in visual design than in writing code?',
    yes: 'prof:UX Designer',
    no: 'fe_or_mobile',
  },
  {
    key: 'fe_or_mobile',
    text: 'Do you prefer building for mobile apps over websites?',
    yes: 'prof:Mobile Developer',
    no: 'prof:Frontend Developer',
  },
  {
    key: 'backend_focus',
    text: 'Are you drawn to infrastructure, deployments, and keeping systems running reliably?',
    yes: 'devops_or_be',
    no: 'be_or_pm',
  },
  {
    key: 'devops_or_be',
    text: 'Do you enjoy automating pipelines and managing cloud environments?',
    yes: 'prof:DevOps Engineer',
    no: 'prof:Backend Developer',
  },
  {
    key: 'be_or_pm',
    text: 'Do you prefer talking to stakeholders and shaping product direction over writing code?',
    yes: 'prof:Product Manager',
    no: 'prof:Software Engineer',
  },
  {
    key: 'data_security',
    text: 'Are you more interested in protecting systems than in analysing data?',
    yes: 'security_focus',
    no: 'data_focus',
  },
  {
    key: 'security_focus',
    text: 'Do you enjoy finding vulnerabilities and thinking like an attacker?',
    yes: 'prof:Cybersecurity Analyst',
    no: 'prof:DevOps Engineer',
  },
  {
    key: 'data_focus',
    text: 'Do you prefer building the models that learn from data rather than presenting insights?',
    yes: 'prof:Machine Learning Engineer',
    no: 'prof:Data Scientist',
  },

  // ── Non-tech branch ────────────────────────────────────────────────────────
  {
    key: 'non_tech',
    text: 'Are you drawn to working with people — patients, clients, or students — as the core of your job?',
    yes: 'people_focused',
    no: 'non_people',
  },

  // ── People-focused ────────────────────────────────────────────────────────
  {
    key: 'people_focused',
    text: 'Is your primary motivation to improve people\'s physical or mental health?',
    yes: 'healthcare',
    no: 'edu_or_services',
  },

  // Healthcare branch
  {
    key: 'healthcare',
    text: 'Do you want to diagnose and treat patients directly?',
    yes: 'clinical',
    no: 'allied_health',
  },
  {
    key: 'clinical',
    text: 'Are you comfortable performing surgical or highly technical procedures?',
    yes: 'surgeon_or_dentist',
    no: 'gp_or_nurse',
  },
  {
    key: 'surgeon_or_dentist',
    text: 'Is your focus on the mouth and dental care specifically?',
    yes: 'prof:Dentist',
    no: 'prof:Surgeon',
  },
  {
    key: 'gp_or_nurse',
    text: 'Do you want to independently diagnose and manage a wide range of conditions?',
    yes: 'prof:Doctor (GP)',
    no: 'nurse_or_paramedic',
  },
  {
    key: 'nurse_or_paramedic',
    text: 'Would you prefer responding to emergencies in the field over ward-based care?',
    yes: 'prof:Paramedic',
    no: 'prof:Nurse',
  },
  {
    key: 'allied_health',
    text: 'Is your interest in mental health and psychology rather than physical rehabilitation?',
    yes: 'mental_health',
    no: 'physical_allied',
  },
  {
    key: 'mental_health',
    text: 'Do you want to assess learning difficulties and support children in education?',
    yes: 'prof:Educational Psychologist',
    no: 'prof:Psychologist',
  },
  {
    key: 'physical_allied',
    text: 'Do you want to help people recover movement and physical function?',
    yes: 'prof:Physiotherapist',
    no: 'pharma_radio',
  },
  {
    key: 'pharma_radio',
    text: 'Are you more interested in medicines and how the body responds to them than in imaging?',
    yes: 'prof:Pharmacist',
    no: 'prof:Radiographer',
  },

  // Education / services branch
  {
    key: 'edu_or_services',
    text: 'Do you want to work in education — teaching or supporting learners?',
    yes: 'education',
    no: 'services_people',
  },
  {
    key: 'education',
    text: 'Is your preference to teach in a school rather than at university level?',
    yes: 'school_side',
    no: 'uni_or_speech',
  },
  {
    key: 'school_side',
    text: 'Do you want to support pupils\' wellbeing and mental health rather than teach a subject?',
    yes: 'prof:School Counsellor',
    no: 'prof:Teacher',
  },
  {
    key: 'uni_or_speech',
    text: 'Is your passion in research and academic writing alongside teaching?',
    yes: 'prof:University Lecturer',
    no: 'prof:Speech Therapist',
  },
  {
    key: 'services_people',
    text: 'Do you enjoy working with animals as much as — or more than — people?',
    yes: 'prof:Veterinarian',
    no: 'hospitality_events',
  },
  {
    key: 'hospitality_events',
    text: 'Is your interest in organising events and experiences rather than running a venue?',
    yes: 'prof:Event Planner',
    no: 'prof:Hotel Manager',
  },

  // ── Non-people branch ─────────────────────────────────────────────────────
  {
    key: 'non_people',
    text: 'Are you drawn to physical structures — buildings, infrastructure, or the environment?',
    yes: 'built_env',
    no: 'ideas_or_numbers',
  },

  // Built environment
  {
    key: 'built_env',
    text: 'Is your focus more on the creative design of spaces than on the technical calculations?',
    yes: 'design_spaces',
    no: 'engineering_branch',
  },
  {
    key: 'design_spaces',
    text: 'Do you want to shape entire urban areas and communities rather than individual buildings?',
    yes: 'prof:Urban Planner',
    no: 'prof:Architect',
  },
  {
    key: 'engineering_branch',
    text: 'Do you prefer working outdoors on large civil projects like roads and bridges?',
    yes: 'civil_or_survey',
    no: 'mech_elec_env',
  },
  {
    key: 'civil_or_survey',
    text: 'Is your interest in measuring and mapping land rather than designing structures?',
    yes: 'prof:Surveyor',
    no: 'civil_or_construction',
  },
  {
    key: 'civil_or_construction',
    text: 'Do you prefer managing teams and budgets on-site over designing the structure itself?',
    yes: 'construction_qs',
    no: 'prof:Civil Engineer',
  },
  {
    key: 'construction_qs',
    text: 'Is your focus on cost management and financial control of projects?',
    yes: 'prof:Quantity Surveyor',
    no: 'prof:Construction Manager',
  },
  {
    key: 'mech_elec_env',
    text: 'Is your concern primarily the natural environment — pollution, water, or air quality?',
    yes: 'prof:Environmental Engineer',
    no: 'mech_elec_struct',
  },
  {
    key: 'mech_elec_struct',
    text: 'Are you more interested in electrical systems than in mechanical or structural ones?',
    yes: 'prof:Electrical Engineer',
    no: 'mech_or_struct',
  },
  {
    key: 'mech_or_struct',
    text: 'Do you prefer designing moving machines and engines over static load-bearing structures?',
    yes: 'prof:Mechanical Engineer',
    no: 'prof:Structural Engineer',
  },

  // Ideas or numbers branch
  {
    key: 'ideas_or_numbers',
    text: 'Are you more drawn to creative work — writing, visuals, storytelling — than to finance or law?',
    yes: 'creative_branch',
    no: 'finance_law_ops',
  },

  // Creative branch
  {
    key: 'creative_branch',
    text: 'Do you want your work to be primarily visual — images, design, film?',
    yes: 'visual_creative',
    no: 'words_strategy',
  },
  {
    key: 'visual_creative',
    text: 'Is your medium moving image — video and film — rather than still visuals?',
    yes: 'prof:Filmmaker',
    no: 'design_or_photo',
  },
  {
    key: 'design_or_photo',
    text: 'Do you prefer capturing real moments with a camera over creating digital designs?',
    yes: 'prof:Photographer',
    no: 'prof:Graphic Designer',
  },
  {
    key: 'words_strategy',
    text: 'Is your interest more in writing and storytelling than in brand strategy?',
    yes: 'writing_focus',
    no: 'brand_strategy',
  },
  {
    key: 'writing_focus',
    text: 'Do you want to report news and investigate stories rather than write marketing copy?',
    yes: 'prof:Journalist',
    no: 'prof:Copywriter',
  },
  {
    key: 'brand_strategy',
    text: 'Do you prefer managing how a company is perceived publicly over managing ad campaigns?',
    yes: 'pr_or_social',
    no: 'ads_or_brand',
  },
  {
    key: 'pr_or_social',
    text: 'Is your preference in writing press releases and handling media over running social channels?',
    yes: 'prof:PR Specialist',
    no: 'prof:Social Media Manager',
  },
  {
    key: 'ads_or_brand',
    text: 'Do you prefer building overall brand identity over concepting individual ad campaigns?',
    yes: 'prof:Brand Strategist',
    no: 'ads_or_marketing',
  },
  {
    key: 'ads_or_marketing',
    text: 'Is your strength in coming up with creative ad ideas rather than managing campaign budgets?',
    yes: 'prof:Advertising Creative',
    no: 'prof:Marketing Manager',
  },

  // Finance / law / ops branch
  {
    key: 'finance_law_ops',
    text: 'Are you more interested in law and regulation than in finance or business operations?',
    yes: 'legal_branch',
    no: 'finance_or_ops',
  },

  // Legal branch
  {
    key: 'legal_branch',
    text: 'Do you want to argue cases and represent clients rather than advise from behind the scenes?',
    yes: 'advocate',
    no: 'advisory_legal',
  },
  {
    key: 'advocate',
    text: 'Is your ambition to sit on the bench and decide cases rather than argue them?',
    yes: 'prof:Judge',
    no: 'prof:Lawyer',
  },
  {
    key: 'advisory_legal',
    text: 'Is your focus on protecting inventions and intellectual property?',
    yes: 'prof:Patent Attorney',
    no: 'compliance_or_para',
  },
  {
    key: 'compliance_or_para',
    text: 'Do you prefer ensuring organisations follow rules over supporting individual cases?',
    yes: 'prof:Compliance Officer',
    no: 'prof:Paralegal',
  },

  // Finance / ops branch
  {
    key: 'finance_or_ops',
    text: 'Is your focus on financial markets, investment, and money rather than business operations?',
    yes: 'finance_branch',
    no: 'ops_branch',
  },
  {
    key: 'finance_branch',
    text: 'Are you drawn to high-stakes deal-making and capital markets?',
    yes: 'investment_or_actuary',
    no: 'accounting_analysis',
  },
  {
    key: 'investment_or_actuary',
    text: 'Do you prefer managing large financial transactions and deals over modelling risk?',
    yes: 'prof:Investment Banker',
    no: 'prof:Actuary',
  },
  {
    key: 'accounting_analysis',
    text: 'Is your focus on tax rules and advising individuals over general accounting or analysis?',
    yes: 'prof:Tax Advisor',
    no: 'accounts_or_analyst',
  },
  {
    key: 'accounts_or_analyst',
    text: 'Do you prefer preparing financial statements and records over interpreting market trends?',
    yes: 'prof:Accountant',
    no: 'prof:Financial Analyst',
  },

  // Ops branch
  {
    key: 'ops_branch',
    text: 'Is your interest in the movement of physical goods — logistics and supply chains?',
    yes: 'supply_chain',
    no: 'chef_or_ops',
  },
  {
    key: 'supply_chain',
    text: 'Do you prefer analysing supply chain data over managing day-to-day logistics?',
    yes: 'prof:Supply Chain Analyst',
    no: 'prof:Logistics Manager',
  },
  {
    key: 'chef_or_ops',
    text: 'Is your passion in cooking and creating food rather than improving business processes?',
    yes: 'prof:Chef',
    no: 'ops_or_policy',
  },
  {
    key: 'ops_or_policy',
    text: 'Do you want to shape public policy and government decisions rather than run business operations?',
    yes: 'prof:Public Policy',
    no: 'prof:Operations Associate',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed…\n')

  // Load professions
  const professionsRaw: ProfessionRaw[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../professions.json'), 'utf-8')
  )

  // ── Step 1: Clear tables in FK-safe order ─────────────────────────────────
  console.log('🗑   Clearing tables…')
  for (const table of ['suggestions', 'questions', 'professions']) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) throw new Error(`Failed to clear ${table}: ${error.message}`)
  }
  console.log('    Tables cleared.\n')

  // ── Step 2: Insert professions ─────────────────────────────────────────────
  console.log('📋  Inserting professions…')
  const { data: insertedProfessions, error: profError } = await supabase
    .from('professions')
    .insert(professionsRaw.map(p => ({
      name: p.name,
      description: p.description,
      traits: p.traits,
      related_ids: [],
      feedback_score: 0,
    })))
    .select('id, name')

  if (profError || !insertedProfessions) {
    throw new Error(`Failed to insert professions: ${profError?.message}`)
  }

  // Name → UUID map
  const profMap = new Map<string, string>(
    insertedProfessions.map(p => [p.name, p.id])
  )

  // Resolve related_ids
  console.log('🔗  Resolving related_ids…')
  for (const raw of professionsRaw) {
    const id = profMap.get(raw.name)
    if (!id) continue
    const relatedIds = raw.related_names
      .map(n => profMap.get(n))
      .filter((v): v is string => v !== undefined)
    await supabase.from('professions').update({ related_ids: relatedIds }).eq('id', id)
  }
  console.log(`    ${insertedProfessions.length} professions inserted.\n`)

  // ── Step 3: Insert questions (pass 1 — no FK links) ───────────────────────
  console.log('🌳  Inserting question nodes (pass 1)…')
  const { data: insertedQuestions, error: qError } = await supabase
    .from('questions')
    .insert(TREE.map(n => ({
      text: n.text,
      yes_next: null,
      no_next: null,
      profession_id: null,
      is_root: n.is_root ?? false,
    })))
    .select('id')

  if (qError || !insertedQuestions) {
    throw new Error(`Failed to insert questions: ${qError?.message}`)
  }

  // key → UUID map (by index, since TREE order is preserved)
  const qMap = new Map<string, string>(
    TREE.map((n, i) => [n.key, insertedQuestions[i].id])
  )

  // ── Step 4: Patch FK links (pass 2) ───────────────────────────────────────
  console.log('🔧  Patching FK links (pass 2)…')

  function resolveTarget(target: string): { yes_next?: string; no_next?: string; profession_id?: string } | null {
    if (target.startsWith('prof:')) {
      const profName = target.slice(5)
      const profId = profMap.get(profName)
      if (!profId) { console.warn(`  ⚠ Unknown profession: ${profName}`); return null }
      return { profession_id: profId, yes_next: null as unknown as string, no_next: null as unknown as string }
    }
    const qId = qMap.get(target)
    if (!qId) { console.warn(`  ⚠ Unknown node key: ${target}`); return null }
    return { yes_next: qId }
  }

  for (const node of TREE) {
    const nodeId = qMap.get(node.key)!
    const patch: Record<string, string | null> = {}

    // yes
    if (node.yes.startsWith('prof:')) {
      const profId = profMap.get(node.yes.slice(5))
      if (!profId) console.warn(`  ⚠ Unknown profession: ${node.yes}`)
      else { patch.profession_id = profId; patch.yes_next = null; patch.no_next = null }
    } else {
      patch.yes_next = qMap.get(node.yes) ?? null
    }

    // no (only set if the target is another question node; prof: branches are handled in pass 3)
    if (!node.yes.startsWith('prof:') && !node.no.startsWith('prof:')) {
      patch.no_next = qMap.get(node.no) ?? null
    }

    // For leaf nodes: yes and no are both professions — this shouldn't happen in our tree
    // but handle gracefully: set profession_id to the 'yes' side
    if (node.yes.startsWith('prof:') && node.no.startsWith('prof:')) {
      const yesProfId = profMap.get(node.yes.slice(5))
      // The 'no' branch maps to a different profession — means both branches are leaves
      // Since Supabase only allows one profession_id per node, this shouldn't occur.
      // Our tree doesn't have this case.
      if (yesProfId) patch.profession_id = yesProfId
    }

    const { error: updateError } = await supabase
      .from('questions')
      .update(patch)
      .eq('id', nodeId)

    if (updateError) {
      throw new Error(`Failed to patch node ${node.key}: ${updateError.message}`)
    }
  }

  // Handle nodes where BOTH yes and no are leaf professions differently:
  // We need two leaf nodes pointing to each profession.
  // In our tree structure, question nodes that have yes='prof:X' actually ARE the leaf —
  // but the tree as written has question nodes whose yes and no are BOTH profession leaves.
  // These need special treatment: patch yes_next and no_next to null,
  // and profession_id is determined by the answer given.
  // Since the DB schema only has one profession_id, we need to ensure those
  // question nodes are actual differentiator questions that each point to a leaf.
  //
  // Our TREE is designed so that every leaf is a question node whose yes OR no is 'prof:X'.
  // The other branch points to another question or another 'prof:Y'.
  // When both are 'prof:', the node IS a leaf question that differentiates two professions.
  // profession_id is set to the 'yes' profession; the app follows yes_next/no_next in the DB.
  //
  // Let's re-patch those nodes properly with separate yes_next / no_next logic:
  console.log('🔧  Re-patching dual-leaf nodes…')
  for (const node of TREE) {
    if (!node.yes.startsWith('prof:') || !node.no.startsWith('prof:')) continue

    const nodeId = qMap.get(node.key)!
    const yesProfId = profMap.get(node.yes.slice(5))
    const noProfId = profMap.get(node.no.slice(5))

    if (!yesProfId || !noProfId) continue

    // Insert two leaf nodes: one for yes, one for no
    const { data: leafNodes, error: leafError } = await supabase
      .from('questions')
      .insert([
        { text: `[leaf] ${node.yes.slice(5)}`, yes_next: null, no_next: null, profession_id: yesProfId, is_root: false },
        { text: `[leaf] ${node.no.slice(5)}`, yes_next: null, no_next: null, profession_id: noProfId, is_root: false },
      ])
      .select('id')

    if (leafError || !leafNodes || leafNodes.length < 2) {
      throw new Error(`Failed to insert leaf nodes for ${node.key}: ${leafError?.message}`)
    }

    const { error: updateError } = await supabase
      .from('questions')
      .update({ yes_next: leafNodes[0].id, no_next: leafNodes[1].id, profession_id: null })
      .eq('id', nodeId)

    if (updateError) {
      throw new Error(`Failed to patch dual-leaf node ${node.key}: ${updateError.message}`)
    }
  }

  // Fix non-leaf nodes that have one prof: branch: need a leaf question node
  console.log('🔧  Re-patching single-leaf branches…')
  for (const node of TREE) {
    const nodeId = qMap.get(node.key)!

    const yeIsProf = node.yes.startsWith('prof:')
    const noIsProf = node.no.startsWith('prof:')

    if (yeIsProf && noIsProf) continue // handled above
    if (!yeIsProf && !noIsProf) continue // pure question node, already handled

    if (yeIsProf && !noIsProf) {
      const profId = profMap.get(node.yes.slice(5))
      if (!profId) continue
      const { data: leaf, error: leafError } = await supabase
        .from('questions')
        .insert({ text: `[leaf] ${node.yes.slice(5)}`, yes_next: null, no_next: null, profession_id: profId, is_root: false })
        .select('id')
        .single()
      if (leafError || !leaf) throw new Error(`Leaf insert failed: ${leafError?.message}`)
      const noId = qMap.get(node.no)
      await supabase.from('questions').update({ yes_next: leaf.id, no_next: noId ?? null, profession_id: null }).eq('id', nodeId)
    }

    if (!yeIsProf && noIsProf) {
      const profId = profMap.get(node.no.slice(5))
      if (!profId) continue
      const { data: leaf, error: leafError } = await supabase
        .from('questions')
        .insert({ text: `[leaf] ${node.no.slice(5)}`, yes_next: null, no_next: null, profession_id: profId, is_root: false })
        .select('id')
        .single()
      if (leafError || !leaf) throw new Error(`Leaf insert failed: ${leafError?.message}`)
      const yesId = qMap.get(node.yes)
      await supabase.from('questions').update({ yes_next: yesId ?? null, no_next: leaf.id, profession_id: null }).eq('id', nodeId)
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true })
  console.log(`\n✅  Seed complete.`)
  console.log(`    Professions inserted : ${insertedProfessions.length}`)
  console.log(`    Question nodes       : ${qCount}`)
}

main().catch(err => {
  console.error('\n❌  Seed failed:', err.message)
  process.exit(1)
})
