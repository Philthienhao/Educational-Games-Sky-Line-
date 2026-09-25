export const GAME_THUMBNAILS = {
  'indoor-pe-dance': '/thumbnails/thumb_pe_dance.jpg',
  'pose-imitation': '/thumbnails/thumb_pose_imitation.jpg',
  'head-tilt': '/thumbnails/thumb_head_tilt.jpg',
  'mario-race': '/thumbnails/thumb_mario_race.jpg',
  'tower-builder': '/thumbnails/thumb_tower_builder.jpg',
  'tug-of-war-dual': '/thumbnails/thumb_tug_of_war.jpg',
  'millionaire': '/thumbnails/thumb_millionaire.jpg',
  'mystery-box': '/thumbnails/thumb_mystery_box.jpg',
  'picture-reveal': '/thumbnails/thumb_picture_reveal.jpg',
  'crossword': '/thumbnails/thumb_crossword.jpg',
  'train': '/thumbnails/thumb_train.jpg',
  'flashcard': '/thumbnails/thumb_flashcard.jpg',
  'fruit-ninja': '/thumbnails/thumb_fruit_ninja.jpg',
  'car-race': '/thumbnails/thumb_car_race.jpg',
  'minesweeper': '/thumbnails/thumb_minesweeper.jpg',
  'flying-words': '/thumbnails/thumb_flying_words.jpg',
  'matching-pairs': '/thumbnails/thumb_matching_pairs.jpg',
  'duck-race': '/thumbnails/thumb_duck_race.jpg',
  'turtle-race': '/thumbnails/thumb_turtle_race.jpg',
  'claw-machine': '/thumbnails/thumb_claw_machine.jpg',
  'astronaut-explorer': '/thumbnails/thumb_astronaut_explorer.jpg',
  'magic-hat': '/thumbnails/thumb_magic_hat.jpg',
  'magic-grimoire': '/thumbnails/thumb_magic_grimoire.jpg',
  'jungle-rescue': '/thumbnails/thumb_jungle_rescue.jpg',
  'jeopardy': '/thumbnails/thumb_jeopardy.jpg',
  'geo-3d-model': '/thumbnails/thumb_geo_3d_model.jpg'
};

export function getGameThumbnail(game) {
  if (!game) return GAME_THUMBNAILS['tug-of-war-dual'];
  if (game.thumbnail) return game.thumbnail;
  if (game.image) return game.image;
  if (game.coverImage) return game.coverImage;

  const engineType = game.engineType || game.id;
  if (engineType && GAME_THUMBNAILS[engineType]) {
    return GAME_THUMBNAILS[engineType];
  }

  // Fallback by game id keyword matching
  const idStr = String(game.id || '').toLowerCase();
  for (const [key, path] of Object.entries(GAME_THUMBNAILS)) {
    if (idStr.includes(key)) return path;
  }

  return GAME_THUMBNAILS['tug-of-war-dual'];
}
