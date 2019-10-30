import { loadTextures } from '../gl/loader';
import {
  GLContext,
  GLSLColors,
  LightSettings,
  Material,
  Materials
} from '../../types';

export const updateColors = (colors: GLSLColors, glContext: GLContext): void => {
  const { gl, programInfo } = glContext;
  gl.useProgram(programInfo.program);
  gl.uniform3fv(programInfo.uniformLocations.uAmbientLightColor, colors.ambientLight);
  gl.uniform3fv(programInfo.uniformLocations.uLeftLightColor, colors.leftLight);
  gl.uniform3fv(programInfo.uniformLocations.uRightLightColor, colors.rightLight);
};

export const updateLightSettings = (lightSettings: LightSettings, glContext: GLContext): void => {
  const { gl, programInfo } = glContext;
  gl.useProgram(programInfo.program);
  gl.uniform1f(programInfo.uniformLocations.uCustomShininess, lightSettings.customShininess);
  gl.uniform1f(programInfo.uniformLocations.uShadowStrength, lightSettings.shadowStrength);
  gl.uniform1f(programInfo.uniformLocations.uAmbientLightIntensity, lightSettings.intensities.ambient);
  gl.uniform1f(programInfo.uniformLocations.uLeftLightIntensity, lightSettings.intensities.left);
  gl.uniform1f(programInfo.uniformLocations.uRightLightIntensity, lightSettings.intensities.right);
  gl.uniform1f(programInfo.uniformLocations.uTopLightIntensity, lightSettings.intensities.top);
  gl.uniform1f(programInfo.uniformLocations.uBottomLightIntensity, lightSettings.intensities.bottom);
};

export const updateMaterials = (glContext: GLContext, onError: Function | undefined): void => {
  const { gl, programInfo, mesh } = glContext;

  gl.useProgram(programInfo.program);

  loadTextures(gl, mesh.materials).then(
    (loadedMaterials: Materials) => {
      mesh.materials = loadedMaterials;

      Object.keys(mesh.materials).forEach((name: string, i: number) => {
        if (i < 3) {
          const mat: Material = mesh.materials[name] as Material;
          if (mat.textures.diffuseMap) {
            gl.activeTexture(gl[`TEXTURE${i}`] as number);
            gl.bindTexture(gl.TEXTURE_2D, mat.textures.diffuseMap);
            gl.uniform1i(programInfo.uniformLocations[`uSampler${i}`], i);
            gl.uniform1f(programInfo.uniformLocations.uHasTexture, 1);
          }

          gl.uniform3fv(programInfo.uniformLocations[`uDiffuseColor${i}`], mat.diffuse || [1, 1, 1]);
          gl.uniform3fv(programInfo.uniformLocations[`uEmissiveColor${i}`], mat.emissive || [0, 0, 0]);
          gl.uniform3fv(programInfo.uniformLocations[`uSpecularColor${i}`], mat.specular || [1, 1, 1]);
          gl.uniform1f(programInfo.uniformLocations[`uReflectivity${i}`], mat.reflectivity ? mat.reflectivity : 1000);
          gl.uniform1f(programInfo.uniformLocations[`uOpacity${i}`], mat.opacity || 1);
        }
      });
    },
    (err) => {
      onError(`Could not render textures: ${err}`);
    },
  );
};

export const removeMaterials = (glContext: GLContext): void => {
  const {
    gl,
    programInfo,
    mesh,
    placeholderTexture
  } = glContext;

  if (!!mesh.materials || mesh.materials === {}) return;
  glContext.textureCount = 0;
  gl.useProgram(programInfo.program);

  Object.keys(mesh.materials).forEach((name, i) => {
    if (i < 3) {
      const mat: Materials = mesh.materials[name] as Materials;
      if (mat && mat.textures.diffuseMap) {
        gl.activeTexture(gl[`TEXTURE${i}`] as number);
        gl.bindTexture(gl.TEXTURE_2D, placeholderTexture);
      }

      gl.uniform1f(programInfo.uniformLocations.uHasTexture, 0);
      gl.uniform3fv(programInfo.uniformLocations[`uDiffuseColor${i}`], [1, 1, 1]);
      gl.uniform3fv(programInfo.uniformLocations[`uEmissiveColor${i}`], [0, 0, 0]);
      gl.uniform3fv(programInfo.uniformLocations[`uSpecularColor${i}`], [1, 1, 1]);
      gl.uniform1f(programInfo.uniformLocations[`uReflectivity${i}`], 1000);
      gl.uniform1f(programInfo.uniformLocations[`uOpacity${i}`], 1);
    }
  });
};
