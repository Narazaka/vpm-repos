async function main() {
  const $url = document.querySelector<HTMLInputElement>("#url");
  $url?.addEventListener("click", () => {
    $url.select();
  });
  document
    .querySelector<HTMLButtonElement>("#copyUrl")
    ?.addEventListener("click", () => {
      $url?.select();
      document.execCommand("copy");
    });

  const $pacakges = Array.from(
    document.querySelectorAll<HTMLElement>(".package"),
  );
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const $query = document.querySelector<HTMLInputElement>("#query")!;
  const $types = Array.from(
    document.querySelectorAll<HTMLInputElement>("[name=type]"),
  );
  const $orderBys = Array.from(
    document.querySelectorAll<HTMLInputElement>("[name=orderBy]"),
  );
  function search() {
    const query = $query.value.toLowerCase();
    const types = new Set(
      $types.filter((el) => el.checked).map((el) => el.value) as (
        | "Any"
        | "Avatar"
        | "World"
      )[],
    );
    const orderBy = $orderBys.find((el) => el.checked)?.value as
      | "added"
      | "name";
    const packageByName: { [name: string]: HTMLElement } = {};
    for (let i = 0; i < $pacakges.length; i++) {
      const $package = $pacakges[i];
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      packageByName[$package.dataset.displayName!] = $package;
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const type = $package.dataset.type! as "Any" | "Avatar" | "World";
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const displayName = $package.dataset.displayName!.toLowerCase();
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const description = $package.dataset.description!.toLowerCase();

      if (
        query &&
        !description.includes(query) &&
        !displayName.includes(query)
      ) {
        $package.classList.add("hide");
      } else if (types.size && !types.has(type)) {
        $package.classList.add("hide");
      } else {
        $package.classList.remove("hide");
      }
    }
    const packageNames = Object.keys(packageByName);
    if (orderBy === "name") {
      packageNames.sort();
      for (let i = 0; i < packageNames.length; i++) {
        const $package = packageByName[packageNames[i]];
        $package.style.order = i.toString();
      }
    } else {
      for (let i = 0; i < $pacakges.length; i++) {
        const $package = $pacakges[i];
        $package.style.order = "";
      }
    }
  }
  $query.addEventListener("input", search);
  // biome-ignore lint/complexity/noForEach: <explanation>
  $types.forEach((el) => el.addEventListener("change", search));
  // biome-ignore lint/complexity/noForEach: <explanation>
  $orderBys.forEach((el) => el.addEventListener("change", search));
  search();
}
document.addEventListener("DOMContentLoaded", main);
