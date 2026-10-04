import type { Team } from "@/data/structure";

/** One team's block: name, optional tag, copy and the areas it covers. Used by both tree layouts. */
export function StructureBranch({ team, no }: { team: Team; no: number }) {
  return (
    <div className="branch" data-team={team.id}>
      <p className="branch-no t-mono" data-hide>
        0{no} / TEAM
      </p>
      <h3 className="branch-name t-display">
        <span className="ln">
          <span className="ln-i" data-hide>
            {team.name}
          </span>
        </span>
      </h3>
      {team.tag && (
        <p className="branch-tag t-mono" data-hide>
          {team.tag}
        </p>
      )}
      <div className="branch-copy">
        {team.copy.map((p, i) => (
          <p key={i} data-hide>
            {p}
          </p>
        ))}
      </div>
      {team.areas && (
        <p className="branch-areas t-mono" data-hide>
          {team.areas.join(" / ")}
        </p>
      )}
    </div>
  );
}
