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
    entry_fee_ton: 0.5
  },
  {
    title: "Astral Shard Collection",
    description: "Collect mystical astral shards",
    prize_image_url: "/giveaway-prizes/astral_shard.png",
    prize_value_ton: 3,
    entry_fee_ton: 0.3
  },
  {
    title: "Sailor's Bow Tie",
    description: "Elegant sailor bow tie NFT",
    prize_image_url: "/giveaway-prizes/bow_tie_sailor.png",
    prize_value_ton: 4,
    entry_fee_ton: 0.4
  },
  {
    title: "Magic Genie Lamp",
    description: "Ancient magical genie lamp",
    prize_image_url: "/giveaway-prizes/genie_lamp.png",
    prize_value_ton: 8,
    entry_fee_ton: 0.8
  },
  {
    title: "Kissed Frog Prince",
    description: "Rare kissed frog NFT",
    prize_image_url: "/giveaway-prizes/kissed_frog.png",
    prize_value_ton: 6,
    entry_fee_ton: 0.6
  }
]

Deno.serve(async (req) => {
  try {
    console.log('Creating new giveaways...')
    
    // Check if there are already active giveaways
    const { data: activeGiveaways, error: checkError } = await supabase
      .from('giveaways')
      .select('id')
      .eq('is_active', true)
      .eq('is_finished', false)
    
    if (checkError) {
      console.error('Error checking active giveaways:', checkError)
      throw checkError
    }
    
    // If there are already 5 or more active giveaways, don't create new ones
    if (activeGiveaways && activeGiveaways.length >= 5) {
      console.log('Already have enough active giveaways')
      return new Response(
        JSON.stringify({ message: 'Already have enough active giveaways', count: activeGiveaways.length }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const giveawaysToCreate = []
    const now = new Date()
    
    for (let i = 0; i < 5; i++) {
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
        max_participants: 10000,
        current_participants: 0,
        is_active: true,
        is_finished: false,
        total_pool_ton: 0
      })
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