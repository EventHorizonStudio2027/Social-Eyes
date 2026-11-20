export type SocialIntent = 'friends' | 'dating' | 'events' | 'casual';
export type PublicProfile = { id: string; display_name: string; bio: string; intent: SocialIntent };
