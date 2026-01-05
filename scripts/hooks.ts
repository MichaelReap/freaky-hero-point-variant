/** Hero Point variant rules */
export function pf2eRerollHook(
    oldRoll: Rolled<CheckRoll>,
    newRoll: Rolled<CheckRoll>,
    resource: ResourceData | boolean,
    keep: "new" | "higher" | "lower" = "new",
) {
    // For compat with older system, where resource:ResourceData was heroPoint:boolean
    const heroPoints = typeof resource === "boolean" ? resource : resource.slug === "hero-points";
    if (!heroPoints || keep !== "new") return;

    // @ts-ignore
    const die = newRoll.dice.find((d) => d instanceof foundry.dice.terms.Die && d.number === 1 && d.faces === 20);
    const result = die?.results.find((r) => r.active && r.result <= 10);

    // Handle Keeley's Hero Point Rule
    if (die && result && game.settings.get(MODULENAME, "heroPointRules") === "keeleysHeroPointRule") {
        newRoll.terms.push(
            // @ts-ignore
            foundry.dice.terms.OperatorTerm.fromData({ class: "OperatorTerm", operator: "+", evaluated: true }),
            // @ts-ignore
            foundry.dice.terms.NumericTerm.fromData({ class: "NumericTerm", number: 10, evaluated: true }),
        );
        // @ts-ignore It's protected. Meh.
        newRoll._total += 10;
        newRoll.options.keeleyAdd10 = true;
    } else if (game.settings.get(MODULENAME, "heroPointRules") === "useHighestHeroPointRoll") {
        // Handle useHighestHeroPointRoll setting
        const oldDie = oldRoll.dice.find(
            (d) => d instanceof foundry.dice.terms.Die && d.number === 1 && d.faces === 20,
        );
        const oldResult = oldDie?.results.find((r) => r.active)?.result ?? 0;
        const newResult = die?.results.find((r) => r.active)?.result ?? 0;

        if (oldResult > newResult) {
            // Replace the new roll's d20 result with the old roll's result
            if (die && die.results.length > 0) {
                die.results[0].result = oldResult;
                // @ts-ignore It's protected. Meh.
                newRoll._total = newRoll.options.keeleyAdd10 ? oldRoll._total + 10 : oldRoll._total;
                newRoll.options.useHighestRoll = true;
            }
        }
        return;
    }
}
