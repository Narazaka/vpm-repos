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
    const { lowerQuery: query, typesSet: types, orderBy } = SearchParams.get();
    const packageByName: { [name: string]: HTMLElement } = {};
    for (let i = 0; i < $pacakges.length; i++) {
      const $package = $pacakges[i];
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      packageByName[$package.dataset.displayName!] = $package;
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const type = $package.dataset.type! as "Any" | "Avatar" | "World";
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const id = $package.dataset.id!;
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const displayName = $package.dataset.displayName!.toLowerCase();
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const description = $package.dataset.description!.toLowerCase();

      if (
        query &&
        !description.includes(query) &&
        !displayName.includes(query) &&
        !id.includes(query)
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
  const initialSearchParams = SearchParams.get();
  $query.value = initialSearchParams.query || "";
  for (const el of $types) {
    el.checked = initialSearchParams.typesSet.has(el.value as Type);
  }
  for (const el of $orderBys) {
    el.checked = initialSearchParams.orderBy === el.value;
  }

  $query.addEventListener("input", () => {
    SearchParams.apply("query", $query.value);
    search();
  });
  // biome-ignore lint/complexity/noForEach: <explanation>
  $types.forEach((el) =>
    el.addEventListener("change", () => {
      SearchParams.apply(
        "types",
        $types.filter((el) => el.checked).map((el) => el.value as Type),
      );
      search();
    }),
  );
  // biome-ignore lint/complexity/noForEach: <explanation>
  $orderBys.forEach((el) =>
    el.addEventListener("change", () => {
      SearchParams.apply(
        "orderBy",
        $orderBys.find((el) => el.checked)?.value as OrderBy,
      );
      search();
    }),
  );
  search();
}
document.addEventListener("DOMContentLoaded", main);

type PropertyOf<T> = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [P in keyof T]: T[P] extends (...args: any[]) => any
    ? never
    : P extends symbol
      ? never
      : P;
}[keyof T];

type Type = "Any" | "Avatar" | "World";
type OrderBy = "added" | "name";

class SearchParams extends URLSearchParams {
  static get() {
    return new SearchParams(window.location.search);
  }
  static apply<T extends PropertyOf<SearchParams>>(
    name: T,
    value: SearchParams[T],
  ) {
    return SearchParams.get().setParam(name, value).apply();
  }
  apply() {
    history.replaceState(null, "", `?${this.toString()}`);
  }
  setParam<T extends PropertyOf<SearchParams>>(name: T, value: this[T]) {
    this[name] = value;
    return this;
  }
  get query() {
    return this.#getSingle("q") || "";
  }
  set query(value: string) {
    this.#setSingle("q", value);
  }
  get types() {
    return this.getAll("type") as Type[];
  }
  set types(value: Type[]) {
    this.delete("type");
    for (const type of value) {
      this.append("type", type);
    }
  }
  get orderBy() {
    const orderBy = this.#getSingle("orderBy");
    if (orderBy === "added") {
      return orderBy;
    }
    return "name";
  }
  set orderBy(value: OrderBy) {
    this.#setSingle("orderBy", value === "name" ? undefined : value);
  }
  get lowerQuery() {
    return this.query?.toLowerCase();
  }
  get typesSet() {
    return new Set(this.types);
  }
  #getSingle(key: string): string | undefined {
    return this.get(key) || undefined;
  }
  #setSingle(key: string, value: string | undefined) {
    if (value) {
      this.set(key, value);
    } else {
      this.delete(key);
    }
  }
}
