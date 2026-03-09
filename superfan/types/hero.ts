export interface Hero {
	id: number;
	name: string;
	real_name: string | null;
	first_appearance: string;
	super_powers: string[];
	coolness_factor: number;
}

export type CreateHeroInput = Omit<Hero, "id">;
