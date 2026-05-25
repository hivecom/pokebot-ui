{
  lib,
  buildNpmPackage,
}:
buildNpmPackage {
  version = "0.1.0";
  pname = "pokebot-vue";
  src = lib.cleanSource ./.;
  npmDepsHash = "sha256-rybDJPFMtIVCR4SBaqNKBR2oL8t4n+97qobeMtB4Z68=";
  makeCacheWritable = true;
  npmFlags = ["--legacy-peer-deps"];

  installPhase = ''
    runHook preInstall
    mkdir -p $out/share/pokebot-vue
    mv dist/* $out/share/pokebot-vue
    runHook postInstall
  '';

  meta = {
    description = "A pokebot front end writtten in Vue";
    maintainers = with lib.maintainers; [jokler];
    license = lib.licenses.agpl3Only;
  };
}
