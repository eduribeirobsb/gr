function calcularNRI(probabilidade, impacto) {
    return impacto * probabilidade;
  }
  
  test('deve calcular corretamente o NRI', () => {
    expect(calcularNRI(4, 3)).toBe(12);
  });