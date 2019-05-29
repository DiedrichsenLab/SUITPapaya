function papaya_makeVertex2VoxelMapping
cd('/Users/jdiedrichsen/Matlab/imaging/suit');
P=gifti('flatmap/PIAL_SUIT.surf.gii'); 
W=gifti('flatmap/WHITE_SUIT.surf.gii'); 
midcoord = (P.vertices + W.vertices)/2; 
V= spm_vol('templates/SUIT.nii'); 
[i,j,k]=spmj_affine_transform(midcoord(:,1),midcoord(:,2),midcoord(:,3),inv(V.mat));  % Transform from x,y,z coordinates to voxels 
A=[[1:length(i)]' round(i)-1 round(j)-1 round(k)-1]; 
dlmwrite('Mapping.txt',A,',');