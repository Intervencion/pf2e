import { ActorSourcePF2e } from "@actor/data/index.ts";
import { AncestrySource } from "@item/base/data/index.ts";
import { isObject } from "@util";
import { MigrationBase } from "../base.ts";

/** Remove alignment traits from PCs and NPCs, ancestry traits from PCs  */
export class Migration698RemoveDerivedActorTraits extends MigrationBase {
    static override version = 0.698;

    override async updateActor(source: ActorSourcePF2e): Promise<void> {
        if (
            !(
                (source.type === "character" || source.type === "npc") &&
                "traits" in source.system.traits &&
                isObject(source.system.traits.traits) &&
                "value" in source.system.traits.traits &&
                Array.isArray(source.system.traits.traits.value)
            )
        ) {
            return;
        }

        const traits = source.system.traits.traits.value;
        for (const trait of ["good", "evil", "lawful", "chaotic"]) {
            const index = traits.indexOf(trait);
            if (index >= 0) traits.splice(index, 1);
        }

        if (source.type === "character") {
            const ancestry = source.items.find((i): i is AncestrySource => i.type === "ancestry");
            if (!ancestry) return;
            for (const trait of ancestry.system.traits.value) {
                const index = traits.indexOf(trait);
                if (index >= 0) traits.splice(index, 1);
            }
        }
    }
}
