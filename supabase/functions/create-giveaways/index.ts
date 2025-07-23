import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const prizes = [
  {
    title: "Golden Ring Giveaway",
    description: "Win a rare golden ring NFT",
    prize_image_url: "/giveaway-prizes/bonded_ring.png",
    prize_value_ton: 5,
    entry_fee_ton: 0.5,
    is_free: false
  },
  {
    title: "Astral Shard Collection",
    description: "Collect mystical astral shards",
    prize_image_url: "/giveaway-prizes/astral_shard.png",
    prize_value_ton: 3,
    entry_fee_ton: 0.3,
    is_free: false
  },
  {
    title: "Sailor's Bow Tie",
    description: "Elegant sailor bow tie NFT",
    prize_image_url: "/giveaway-prizes/bow_tie_sailor.png",
    prize_value_ton: 4,
    entry_fee_ton: 0.4,
    is_free: false
  },
  {
    title: "Magic Genie Lamp",
    description: "Ancient magical genie lamp",
    prize_image_url: "/giveaway-prizes/genie_lamp.png",
    prize_value_ton: 8,
    entry_fee_ton: 0.8,
    is_free: false
  },
  {
    title: "Kissed Frog Prince",
    description: "Rare kissed frog NFT",
    prize_image_url: "/giveaway-prizes/kissed_frog.png",
    prize_value_ton: 6,
    entry_fee_ton: 0.6,
    is_free: false
  }
]

const freePrizes = [
  {
    title: "Free Snow Mittens Event",
    description: "Join for free and win rare snow mittens!",
    prize_image_url: "https://assets.pepecase.app/assets/snow_mittens_dark_grape.png",
    prize_value_ton: 2.0,
    entry_fee_ton: 0.0,
    is_free: true
  },
  {
    title: "Free Lunar Snake Giveaway",
    description: "Win a mystical lunar snake for free!",
    prize_image_url: "https://assets.pepecase.app/assets/lunar_snake_neurotoxin.png",
    prize_value_ton: 3.5,
    entry_fee_ton: 0.0,
    is_free: true
  },
  {
    title: "Free Tsunami Pop Event",
    description: "Get your free tsunami lollipop!",
    prize_image_url: "https://assets.pepecase.app/assets/lol_pop_tsunami.png",
    prize_value_ton: 1.5,
    entry_fee_ton: 0.0,
    is_free: true
  },
  {
    title: "Free Snake Box Surprise",
    description: "Open the buttercup snake box for free!",
    prize_image_url: "https://assets.pepecase.app/assets/snake_box_buttercup.png",
    prize_value_ton: 2.5,
    entry_fee_ton: 0.0,
    is_free: true
  },
  {
    title: "Free Rare Calendar Event",
    description: "Win a rare desk calendar for free!",
    prize_image_url: "https://assets.pepecase.app/assets/desk_calendar_rare_event.png",
    prize_value_ton: 4.0,
    entry_fee_ton: 0.0,
    is_free: true
  }
]

Deno.serve(async (req) => {
  try {
    console.log('Creating new giveaways...')
    
    // Check if there are already active paid giveaways
    const { data: activePaidGiveaways, error: checkPaidError } = await supabase
      .from('giveaways')
      .select('id')
      .eq('is_active', true)
      .eq('is_finished', false)
      .eq('is_free', false)
    
    if (checkPaidError) {
      console.error('Error checking active paid giveaways:', checkPaidError)
      throw checkPaidError
    }

    // Check if there are already active free giveaways
    const { data: activeFreeGiveaways, error: checkFreeError } = await supabase
      .from('giveaways')
      .select('id')
      .eq('is_active', true)
      .eq('is_finished', false)
      .eq('is_free', true)
    
    if (checkFreeError) {
      console.error('Error checking active free giveaways:', checkFreeError)
      throw checkFreeError
    }
    
    const giveawaysToCreate = []
    const now = new Date()
    
    // Create paid giveaways if needed (max 5)
    if (!activePaidGiveaways || activePaidGiveaways.length < 5) {
      const neededPaid = 5 - (activePaidGiveaways?.length || 0)
      for (let i = 0; i < neededPaid; i++) {
        const prize = prizes[i % prizes.length]
        const startTime = new Date(now.getTime() + (i * 30 * 60 * 1000)) // Stagger by 30 minutes
        const endTime = new Date(startTime.getTime() + (4 * 60 * 60 * 1000)) // 4 hours duration
        
        giveawaysToCreate.push({
          title: prize.title,
          description: prize.description,
          prize_image_url: prize.prize_image_url,
          prize_value_ton: prize.prize_value_ton,
          entry_fee_ton: prize.entry_fee_ton,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          max_participants: 100,
          current_participants: 0,
          is_active: true,
          is_finished: false,
          total_pool_ton: 0,
          is_free: false
        })
      }
    }

    // Create free giveaways if needed (max 5)
    if (!activeFreeGiveaways || activeFreeGiveaways.length < 5) {
      const neededFree = 5 - (activeFreeGiveaways?.length || 0)
      for (let i = 0; i < neededFree; i++) {
        const prize = freePrizes[i % freePrizes.length]
        const startTime = new Date(now.getTime() + (i * 45 * 60 * 1000)) // Stagger by 45 minutes for free events
        const endTime = new Date(startTime.getTime() + (4 * 60 * 60 * 1000)) // 4 hours duration
        
        giveawaysToCreate.push({
          title: prize.title,
          description: prize.description,
          prize_image_url: prize.prize_image_url,
          prize_value_ton: prize.prize_value_ton,
          entry_fee_ton: prize.entry_fee_ton,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          max_participants: 500,
          current_participants: 0,
          is_active: true,
          is_finished: false,
          total_pool_ton: 0,
          is_free: true
        })
      }
    }

    // If no giveaways need to be created
    if (giveawaysToCreate.length === 0) {
      console.log('Already have enough active giveaways')
      return new Response(
        JSON.stringify({ 
          message: 'Already have enough active giveaways', 
          paidCount: activePaidGiveaways?.length || 0,
          freeCount: activeFreeGiveaways?.length || 0
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const { data, error } = await supabase
      .from('giveaways')
      .insert(giveawaysToCreate)
      .select()
    
    if (error) {
      console.error('Error creating giveaways:', error)
      throw error
    }
    
    console.log(`Created ${data.length} new giveaways`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${data.length} new giveaways`,
        giveaways: data 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in create-giveaways function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})