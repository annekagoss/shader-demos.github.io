import {
  Materials
} from '../../types';

interface LoadedImage {
  matName: string;
  type: string;
  image: HTMLImageElement;
}

// TODO: async this
export function loadTextures(gl: WebGLRenderingContext, materials: Materials): Promise<Materials> {
  let promises: Promise<LoadedImage>[] = []

  // TODO: un-fuck this
  Object.keys(materials).forEach(matName => {
    const { textures } = materials[matName]
    if (textures && textures !== {}) {
      const matPromises: Promise<LoadedImage>[] = Object.keys(textures)
        .filter(type => !(!textures[type]))
        .map(type => initTexture(matName, type, textures[type]))
      promises = promises.concat(matPromises)
    }
  })

  return Promise.all(promises).then(values => {
    const loadedMaterials: Materials = materials;
    values.forEach((value: LoadedImage) => {
      const { matName, type, image } = value
      if (image && image.src) {
        const boundTexture: WebGLTexture = bindTexture(gl, image)
        loadedMaterials[matName].textures[type] = boundTexture
      }
    })
    delete loadedMaterials.textures
    return loadedMaterials
  })
}

const initTexture = (matName: string, type: string, source: string): Promise<LoadedImage> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve({ matName, type, image })
    image.onerror = e => reject(e)
    image.src = source
  })

function bindTexture(gl, image) {
  const level = 0
  const internalFormat = gl.RGBA
  const sourceFormat = gl.RGBA
  const sourceType = gl.UNSIGNED_BYTE
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, sourceFormat, sourceType, image)
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    gl.generateMipmap(gl.TEXTURE_2D)
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  }
  return texture
}

const isPowerOf2 = value => (value & (value - 1)) === 0
