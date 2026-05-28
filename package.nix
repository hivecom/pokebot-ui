{
  lib,
  buildNpmPackage,
}:
buildNpmPackage {
  version = "0.1.0";
  pname = "pokebot-ui";
  src = lib.cleanSource ./.;
  npmDepsHash = "sha256-tzjqdAdpSw0El2ythGqCkbGp2RYdKj1ka64IBgcTJtM=";
  makeCacheWritable = true;
  npmFlags = ["--legacy-peer-deps"];

  installPhase = ''
    runHook preInstall
    mkdir -p $out/share/pokebot-ui
    mv dist/* $out/share/pokebot-ui
    runHook postInstall
  '';

  meta = {
    description = "A pokebot front end writtten in Vue";
    maintainers = with lib.maintainers; [jokler];
    license = lib.licenses.agpl3Only;
  };
}
