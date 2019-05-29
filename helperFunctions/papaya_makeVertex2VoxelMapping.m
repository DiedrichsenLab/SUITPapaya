function papaya_makeVertex2VoxelMapping
P=gifti('/Users/jdiedrichsen/Matlab/imaging/suit/flatmap/PIAL_SUIT.surf.gii'); 
W=gifti('/Users/jdiedrichsen/Matlab/imaging/suit/flatmap/WHITE_SUIT.surf.gii'); 
midcoord = (P.vertices + W.vertices)/2; 
V= spm_vol('/Users/jdiedrichsen/Matlab/imaging/suit/templates/SUIT.nii'); 
% Note that Papaya stores the image in LAS coordinate
[i,j,k]=spmj_affine_transform(midcoord(:,1),midcoord(:,2),midcoord(:,3),inv(V.mat));  % Transform from x,y,z coordinates to voxels 

% Since voxels are 0 based and in LAS coordinates
A=[[1:length(i)]' round(i)-1 V.dim(2)-round(j) V.dim(3)-round(k)]; 
dlmwrite('Mapping.txt',A,',');