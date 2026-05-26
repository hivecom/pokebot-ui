{
  modulesPath,
  config,
  pkgs,
  lib,
  ...
}:
with lib; let
  cfg = config.services.pokebot-vue;
in {
  options = {
    services.pokebot-vue = {
      enable = mkOption {
        type = types.bool;
        default = false;
        description = ''
          Whether to run pokebot-vue.
        '';
      };
      package = mkOption {
        type = types.package;
        default = pkgs.callPackage ../package.nix {};
        description = "Pokebot-vue package";
      };
      nginx = {
        enable = mkOption {
          type = types.bool;
          default = false;
          description = ''
            Whether to enable nginx virtual host management.
            Further nginx configuration can be done by adapting <literal>services.nginx.virtualHosts.&lt;name&gt;</literal>.
            See <xref linkend="opt-services.nginx.virtualHosts"/> for further information.
          '';
        };
        virtualHost = mkOption {
          type = types.submodule (
            recursiveUpdate (import (modulesPath + "/services/web-servers/nginx/vhost-options.nix") {
              inherit config lib;
            }) {}
          );
          example = literalExpression ''
            {
              serverName = "pokebot.example.org";
              forceSSL = true;
              enableACME = true;
            }
          '';
          description = ''
            Nginx configuration can be done by adapting `services.nginx.virtualHosts.<name>`.
            See [](#opt-services.nginx.virtualHosts) for further information.
          '';
        };
      };
    };
  };

  config = mkIf cfg.enable {
    services.nginx = mkIf cfg.nginx.enable {
      enable = true;
      virtualHosts.${cfg.nginx.virtualHost.serverName} = lib.mkMerge [
        cfg.nginx.virtualHost
        {
          # NOTE: i'm not sure why but this does not work without settings a priority
          root = lib.mkForce "${cfg.package}/share/pokebot-vue";

          locations = {
            "/" = {
              tryFiles = "$uri $uri/ /index.html index.htm";
            };
          };
        }
      ];
    };
  };
}
